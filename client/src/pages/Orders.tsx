import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Eye, Edit } from "lucide-react";
import OrderModal from "@/components/OrderModal";
import StatusBadge from "@/components/StatusBadge";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  product?: {
    name: string;
  };
}

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/api/orders?status=${statusFilter}` : "/api/orders";
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: number; status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const canChangeStatus = (currentStatus: string, newStatus: string) => {
    if (user?.role === 'admin') return true;
    
    const rolePermissions: Record<string, string[]> = {
      'receptionist': ['confirmed'],
      'components': ['components_selected'],
      'assembly': ['assembly_started', 'assembly_completed'],
      'packaging': ['packaged'],
      'shipping': ['shipped'],
    };

    const allowedStatuses = rolePermissions[user?.role || ''] || [];
    return allowedStatuses.includes(newStatus);
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      'created': 'confirmed',
      'confirmed': 'components_selected',
      'components_selected': 'assembly_started',
      'assembly_started': 'assembly_completed',
      'assembly_completed': 'packaged',
      'packaged': 'shipped',
      'shipped': 'delivered',
    };
    return statusFlow[currentStatus];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Track and manage all customer orders</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'receptionist') && (
          <Button 
            onClick={() => setShowOrderModal(true)}
            className="bg-sky-blue-500 hover:bg-sky-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="components_selected">Components Selected</SelectItem>
                  <SelectItem value="assembly_started">Assembly Started</SelectItem>
                  <SelectItem value="assembly_completed">Assembly Completed</SelectItem>
                  <SelectItem value="packaged">Packaged</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-gray-900">
                              {order.customer?.firstName} {order.customer?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{order.customer?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-900">{order.product?.name || 'Custom PC'}</div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          ${parseFloat(order.totalAmount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(() => {
                              const nextStatus = getNextStatus(order.status);
                              return nextStatus && canChangeStatus(order.status, nextStatus) ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(order.id, nextStatus)}
                                  disabled={updateStatusMutation.isPending}
                                  className="border-sky-blue-500 text-sky-blue-500 hover:bg-sky-blue-50"
                                >
                                  <StatusBadge status={nextStatus} />
                                </Button>
                              ) : null;
                            })()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500">No orders found</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showOrderModal && (
        <OrderModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
          }}
        />
      )}
    </div>
  );
}
