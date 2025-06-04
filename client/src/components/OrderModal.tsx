import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import StatusBadge from "./StatusBadge";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Package, 
  Truck,
  X,
  User,
  MapPin,
  Monitor,
  Cpu,
  HardDrive,
  Zap
} from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  specifications?: any;
  notes?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  product?: {
    name: string;
  };
}

interface OrderHistory {
  id: number;
  status: string;
  previousStatus: string;
  notes?: string;
  timestamp: string;
  changedBy: {
    firstName: string;
    lastName: string;
  };
}

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({ order, onClose, onSuccess }: OrderModalProps) {
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ["/api/orders", order?.id],
    enabled: !!order?.id,
    queryFn: async () => {
      const response = await fetch(`/api/orders/${order!.id}`, {
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
    mutationFn: async ({ status, notes }: { status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/orders/${order!.id}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", order?.id] });
      onSuccess();
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

  if (!order) return null;

  const orderData = orderDetails || order;

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      created: Clock,
      confirmed: CheckCircle,
      components_selected: Package,
      assembly_started: Clock,
      assembly_completed: CheckCircle,
      packaged: Package,
      shipped: Truck,
      delivered: CheckCircle,
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "text-gray-500",
      confirmed: "text-blue-500",
      components_selected: "text-yellow-500",
      assembly_started: "text-orange-500",
      assembly_completed: "text-purple-500",
      packaged: "text-indigo-500",
      shipped: "text-green-500",
      delivered: "text-emerald-500",
    };
    return colors[status] || "text-gray-500";
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

  const handleStatusUpdate = async (newStatus: string) => {
    setActionLoading(true);
    try {
      await updateStatusMutation.mutateAsync({ status: newStatus, notes });
      setNotes("");
    } finally {
      setActionLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Order Details - {orderData.orderNumber}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              </div>
            ) : (
              <>
                {/* Order Status Timeline */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Order Progress</h4>
                  {orderData.history && orderData.history.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                      <div className="space-y-6">
                        {orderData.history.map((historyItem: OrderHistory, index: number) => {
                          const StatusIcon = getStatusIcon(historyItem.status);
                          const isCompleted = true; // All items in history are completed
                          
                          return (
                            <div key={historyItem.id} className="relative flex items-center space-x-4">
                              <div className={`w-8 h-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'} rounded-full flex items-center justify-center relative z-10`}>
                                <StatusIcon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-500'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {formatStatus(historyItem.status)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {historyItem.notes || `Status changed by ${historyItem.changedBy.firstName} ${historyItem.changedBy.lastName}`}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(historyItem.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No status history available
                    </div>
                  )}
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Customer Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <div className="font-medium text-gray-900">
                          {orderData.customer?.firstName} {orderData.customer?.lastName}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <div className="font-medium text-gray-900">
                          {orderData.customer?.email}
                        </div>
                      </div>
                      {orderData.customer?.phone && (
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <div className="font-medium text-gray-900">
                            {orderData.customer.phone}
                          </div>
                        </div>
                      )}
                      {orderData.shippingAddress && (
                        <div>
                          <label className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Shipping Address
                          </label>
                          <div className="font-medium text-gray-900">
                            {orderData.shippingAddress}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      Product Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Configuration</label>
                        <div className="font-medium text-gray-900">
                          {orderData.product?.name || 'Custom PC Build'}
                        </div>
                      </div>
                      
                      {orderData.specifications && (
                        <>
                          {orderData.specifications.processor && (
                            <div>
                              <label className="text-sm text-gray-600 flex items-center">
                                <Cpu className="w-4 h-4 mr-1" />
                                Processor
                              </label>
                              <div className="font-medium text-gray-900">
                                {orderData.specifications.processor}
                              </div>
                            </div>
                          )}
                          
                          {orderData.specifications.graphics && (
                            <div>
                              <label className="text-sm text-gray-600 flex items-center">
                                <Zap className="w-4 h-4 mr-1" />
                                Graphics Card
                              </label>
                              <div className="font-medium text-gray-900">
                                {orderData.specifications.graphics}
                              </div>
                            </div>
                          )}
                          
                          {orderData.specifications.memory && (
                            <div>
                              <label className="text-sm text-gray-600">Memory</label>
                              <div className="font-medium text-gray-900">
                                {orderData.specifications.memory}
                              </div>
                            </div>
                          )}
                          
                          {orderData.specifications.storage && (
                            <div>
                              <label className="text-sm text-gray-600 flex items-center">
                                <HardDrive className="w-4 h-4 mr-1" />
                                Storage
                              </label>
                              <div className="font-medium text-gray-900">
                                {orderData.specifications.storage}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Total Price</span>
                          <span className="text-lg font-bold text-sky-blue-600">
                            ${parseFloat(orderData.totalAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Status and Actions */}
                <div className="bg-sky-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Current Status & Actions</h4>
                  
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600">Current Status:</span>
                      <StatusBadge status={orderData.status} />
                    </div>
                  </div>

                  {(() => {
                    const nextStatus = getNextStatus(orderData.status);
                    return nextStatus && canChangeStatus(orderData.status, nextStatus) ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any notes about this status change..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => handleStatusUpdate(nextStatus)}
                            disabled={actionLoading || updateStatusMutation.isPending}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            {actionLoading ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as {formatStatus(nextStatus)}
                              </>
                            )}
                          </Button>
                          
                          {orderData.status === 'assembly_started' && (
                            <Button
                              variant="outline"
                              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Report Issue
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-600">
                        {orderData.status === 'delivered' 
                          ? 'Order has been completed and delivered.' 
                          : 'No actions available for your role at this stage.'
                        }
                      </div>
                    );
                  })()}
                </div>

                {/* Tracking Information */}
                {orderData.trackingNumber && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Shipping Information
                    </h4>
                    <div>
                      <label className="text-sm text-gray-600">Tracking Number</label>
                      <div className="font-medium text-gray-900 font-mono">
                        {orderData.trackingNumber}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
