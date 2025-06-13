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

  const formatStatus = (status: string) => {
    const statusTranslations: Record<string, string> = {
      'created': 'Créée',
      'confirmed': 'Confirmée',
      'components_selected': 'Composants Sélectionnés',
      'assembly_started': 'Assemblage Commencé',
      'assembly_completed': 'Assemblage Terminé',
      'packaged': 'Emballée',
      'shipped': 'Expédiée',
      'delivered': 'Livrée'
    };
    return statusTranslations[status] || status;
  };

  const getStatusMessage = (status: string, changedBy: { firstName: string; lastName: string }, notes?: string) => {
    if (notes) {
      return notes;
    }
    
    const statusMessages: Record<string, string> = {
      'created': `Commande créée par ${changedBy.firstName} ${changedBy.lastName}`,
      'confirmed': `Statut mis à jour vers confirmée par ${changedBy.firstName} ${changedBy.lastName}`,
      'components_selected': `Composants ramassés avec succès par ${changedBy.firstName} ${changedBy.lastName}`,
      'assembly_started': `Assemblage commencé par ${changedBy.firstName} ${changedBy.lastName}`,
      'assembly_completed': `Assemblage terminé par ${changedBy.firstName} ${changedBy.lastName}`,
      'packaged': `Statut mis à jour vers emballée par ${changedBy.firstName} ${changedBy.lastName}`,
      'shipped': `Statut mis à jour vers expédiée par ${changedBy.firstName} ${changedBy.lastName}`,
      'delivered': `Statut mis à jour vers livrée par ${changedBy.firstName} ${changedBy.lastName}`
    };
    
    return statusMessages[status] || `Statut changé par ${changedBy.firstName} ${changedBy.lastName}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "text-gray-500",
      confirmed: "text-blue-500",
      components_selected: "text-orange-500",
      assembly_started: "text-yellow-500",
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
      'picker': ['components_selected'],
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
                                  {getStatusMessage(historyItem.status, historyItem.changedBy, historyItem.notes)}
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
                        <div className="text-gray-900">{orderData.customer?.email}</div>
                      </div>
                      {orderData.customer?.phone && (
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <div className="text-gray-900">{orderData.customer.phone}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Shipping Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Address</label>
                        <div className="text-gray-900">
                          {orderData.shippingAddress || "Address not provided"}
                        </div>
                      </div>
                      {orderData.trackingNumber && (
                        <div>
                          <label className="text-sm text-gray-600">Tracking Number</label>
                          <div className="text-gray-900 font-mono">{orderData.trackingNumber}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Components */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    Order Components
                  </h4>
                  {orderData.specifications?.components ? (
                    <div className="space-y-4">
                      {orderData.specifications.components.map((component: any, index: number) => {
                        const getComponentIcon = (type: string) => {
                          const icons: Record<string, any> = {
                            'CPU': Cpu,
                            'Storage': HardDrive,
                            'PSU': Zap,
                            'default': Monitor
                          };
                          return icons[type] || icons.default;
                        };
                        
                        const ComponentIcon = getComponentIcon(component.type);
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <ComponentIcon className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-900">{component.name}</div>
                                <div className="text-sm text-gray-600">
                                  {component.brand} {component.model} - {component.type}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">Qty: {component.quantity}</div>
                              <div className="text-sm text-gray-600">${component.price}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                          <span className="text-xl font-bold text-green-600">${orderData.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No components specified
                    </div>
                  )}
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
                    const canProceed = nextStatus && canChangeStatus(orderData.status, nextStatus);
                    
                    return canProceed ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                            Notes (Optional)
                          </Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about this status change..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleStatusUpdate(nextStatus)}
                            disabled={actionLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {actionLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}