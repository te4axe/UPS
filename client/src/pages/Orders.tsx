import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Package, Eye, Edit, Play, Truck, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StatusBadge from "@/components/StatusBadge";
import OrderModal from "@/components/OrderModal";

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
  specifications?: any;
  notes?: string;
}

export default function Orders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    retry: false,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: number; status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsNewOrderDialogOpen(false);
      toast({
        title: "Success",
        description: "Order created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter orders based on search and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Get orders relevant to user's role
  const getRelevantOrders = () => {
    if (!user) return filteredOrders;

    switch (user.role) {
      case 'admin':
        return filteredOrders;
      case 'receptionist':
        return filteredOrders.filter(order => 
          ['created', 'confirmed'].includes(order.status)
        );
      case 'components':
        return filteredOrders.filter(order => 
          ['confirmed', 'components_selected'].includes(order.status)
        );
      case 'assembly':
        return filteredOrders.filter(order => 
          ['components_selected', 'assembly_started', 'assembly_completed'].includes(order.status)
        );
      case 'packaging':
        return filteredOrders.filter(order => 
          ['assembly_completed', 'packaged'].includes(order.status)
        );
      case 'shipping':
        return filteredOrders.filter(order => 
          ['packaged', 'shipped', 'delivered'].includes(order.status)
        );
      default:
        return filteredOrders;
    }
  };

  const relevantOrders = getRelevantOrders();

  // Get next status based on current status and user role
  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'created': 'confirmed',
      'confirmed': 'components_selected',
      'components_selected': 'assembly_started',
      'assembly_started': 'assembly_completed',
      'assembly_completed': 'packaged',
      'packaged': 'shipped',
      'shipped': 'delivered'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const canUpdateStatus = (order: Order) => {
    if (!user) return false;

    const userCanUpdate = {
      'receptionist': ['created'],
      'components': ['confirmed'],
      'assembly': ['components_selected', 'assembly_started'],
      'packaging': ['assembly_completed'],
      'shipping': ['packaged'],
      'admin': ['created', 'confirmed', 'components_selected', 'assembly_started', 'assembly_completed', 'packaged']
    };

    return userCanUpdate[user.role as keyof typeof userCanUpdate]?.includes(order.status) || false;
  };

  const getActionLabel = (order: Order) => {
    const labels = {
      'created': 'Confirm Order',
      'confirmed': 'Select Components',
      'components_selected': 'Start Assembly',
      'assembly_started': 'Complete Assembly',
      'assembly_completed': 'Package Order',
      'packaged': 'Ship Order'
    };
    return labels[order.status as keyof typeof labels] || 'Update';
  };

  const handleStatusUpdate = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      updateOrderMutation.mutate({
        orderId: order.id,
        status: nextStatus,
        notes: `Status updated to ${nextStatus.replace('_', ' ')} by ${user?.firstName} ${user?.lastName}`
      });
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        
        {(user.role === 'admin' || user.role === 'receptionist') && (
          <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Add a new customer order to the system
                </DialogDescription>
              </DialogHeader>
              <NewOrderForm
                onSubmit={(data) => createOrderMutation.mutate(data)}
                isLoading={createOrderMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {relevantOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <StatusBadge status={order.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                      {order.customer && (
                        <p>
                          <span className="font-medium">Customer:</span> {order.customer.firstName} {order.customer.lastName}
                        </p>
                      )}
                      {order.product && (
                        <p>
                          <span className="font-medium">Product:</span> {order.product.name}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Amount:</span> ${order.totalAmount}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {canUpdateStatus(order) && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order)}
                        disabled={updateOrderMutation.isPending}
                        className="w-full sm:w-auto"
                      >
                        {updateOrderMutation.isPending ? (
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {getActionLabel(order)}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {relevantOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {orders?.length === 0 
                    ? "No orders have been created yet." 
                    : "No orders match your current filters."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}

// New Order Form Component
function NewOrderForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    productId: '',
    totalAmount: '',
    specifications: '',
    notes: '',
    shippingAddress: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.customerFirstName}
            onChange={(e) => setFormData(prev => ({ ...prev, customerFirstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.customerLastName}
            onChange={(e) => setFormData(prev => ({ ...prev, customerLastName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.customerEmail}
          onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.customerPhone}
          onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="product">Product</Label>
        <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Gaming PC Pro - $2,499.99</SelectItem>
            <SelectItem value="3">Office PC Standard - $899.99</SelectItem>
            <SelectItem value="4">Workstation Ultra - $3,999.99</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="totalAmount">Total Amount</Label>
        <Input
          id="totalAmount"
          type="number"
          step="0.01"
          value={formData.totalAmount}
          onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="specifications">Specifications (JSON)</Label>
        <Textarea
          id="specifications"
          value={formData.specifications}
          onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
          placeholder='{"cpu": "Intel Core i7", "ram": "32GB", "storage": "1TB SSD"}'
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="shippingAddress">Shipping Address</Label>
        <Textarea
          id="shippingAddress"
          value={formData.shippingAddress}
          onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: e.target.value }))}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Order"}
      </Button>
    </form>
  );
}