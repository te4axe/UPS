import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Package, Eye, Edit, Play, Truck, CheckCircle, X, ShoppingCart } from "lucide-react";
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

interface Component {
  id: number;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  price: string;
  stockQuantity: number;
  minStockLevel?: number;
  specifications?: any;
}

interface SelectedComponent {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: string;
  brand?: string;
  model?: string;
}

interface NewOrderFormData {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  selectedComponents: SelectedComponent[];
  totalAmount: string;
  notes: string;
  shippingAddress: string;
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
    mutationFn: async (orderData: NewOrderFormData) => {
      console.log('Creating order with data:', orderData);
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
      console.error('Order creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
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
  <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto mx-auto">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold">Create New Order</DialogTitle>
      <DialogDescription>
        Add a new customer order with custom components from inventory
      </DialogDescription>
    </DialogHeader>
    <NewOrderFormWithInventory
      onSubmit={(data) => createOrderMutation.mutate(data)}
      isLoading={createOrderMutation.isPending}
      onCancel={() => setIsNewOrderDialogOpen(false)}
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

// ✅ FIXED: Component Search with proper authentication
function ComponentSearch({ 
  onComponentSelect 
}: { 
  onComponentSelect: (component: Component) => void 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIXED: Proper authentication token handling
  const searchComponents = async (term: string) => {
    if (!term.trim() || term.length < 1) {
      setComponents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Searching for:', term);
      
      // ✅ FIXED: Try both possible token names
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in again - no authentication token found');
      }

      const response = await fetch(`/api/components?search=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired - please log in again');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Search results:', data);
      
      setComponents(Array.isArray(data) ? data : []);
      setIsSearchOpen(true);
      
    } catch (err: any) {
      console.error('❌ Search error:', err);
      setError(err.message);
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Debounced search with proper cleanup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchComponents(searchTerm);
      } else {
        setComponents([]);
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleComponentSelect = (component: Component) => {
    console.log('✅ Selected component:', component);
    onComponentSelect(component);
    setSearchTerm("");
    setIsSearchOpen(false);
    setComponents([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search components (try 'nvidia', 'intel', 'cpu', 'gpu')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          onFocus={() => {
            if (searchTerm.trim() && components.length > 0) {
              setIsSearchOpen(true);
            }
          }}
          onBlur={() => {
            // Delay hiding to allow clicking on results
            setTimeout(() => setIsSearchOpen(false), 200);
          }}
        />
      </div>

      {/* ✅ FIXED: Search Results Dropdown with better UX */}
      {isSearchOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Searching components...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p className="font-medium">Search Error:</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => searchComponents(searchTerm)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Try Again
              </button>
            </div>
          ) : components && components.length > 0 ? (
            <div>
              <div className="px-3 py-2 bg-gray-50 border-b text-sm text-gray-600">
                Found {components.length} component(s)
              </div>
              {components.map((component) => (
                <div
                  key={component.id}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleComponentSelect(component)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{component.name}</p>
                      <p className="text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                          {component.type}
                        </span>
                        {component.brand && `${component.brand} `}
                        {component.model && `${component.model}`}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Stock: {component.stockQuantity} units
                        {component.stockQuantity <= (component.minStockLevel || 5) && (
                          <span className="ml-2 text-red-600 font-medium">Low Stock!</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${component.price}</p>
                      <p className="text-xs text-gray-500">per unit</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.length >= 1 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No components found matching "{searchTerm}"</p>
              <div className="mt-2 text-sm">
                <p>Try searching for:</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {['nvidia', 'intel', 'cpu', 'gpu', 'ram', 'ssd'].map(term => (
                    <button
                      key={term}
                      onClick={() => setSearchTerm(term)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ✅ COMPLETELY FIXED: New Order Form with proper component search (NO DROPDOWN!)
function NewOrderFormWithInventory({ 
  onSubmit, 
  isLoading, 
  onCancel 
}: { 
  onSubmit: (data: NewOrderFormData) => void; 
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<NewOrderFormData>({
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    selectedComponents: [],
    totalAmount: '',
    notes: '',
    shippingAddress: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ FIXED: Proper total calculation
  const calculateTotal = () => {
    const total = formData.selectedComponents.reduce(
      (sum, comp) => sum + (comp.price * comp.quantity), 
      0
    );
    setFormData(prev => ({ ...prev, totalAmount: total.toFixed(2) }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.selectedComponents]);

  // ✅ FIXED: Component selection handler
  const handleComponentSelect = (component: Component) => {
    const existingIndex = formData.selectedComponents.findIndex(c => c.id === component.id);
    
    if (existingIndex >= 0) {
      // Component already exists, increase quantity
      const updated = [...formData.selectedComponents];
      updated[existingIndex].quantity += 1;
      setFormData(prev => ({ ...prev, selectedComponents: updated }));
    } else {
      // Add new component
      const newComponent: SelectedComponent = {
        id: component.id,
        name: component.name,
        price: parseFloat(component.price),
        quantity: 1,
        type: component.type,
        brand: component.brand,
        model: component.model
      };
      setFormData(prev => ({ 
        ...prev, 
        selectedComponents: [...prev.selectedComponents, newComponent] 
      }));
    }
  };

  // ✅ FIXED: Quantity change handler
  const handleQuantityChange = (componentId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setFormData(prev => ({
        ...prev,
        selectedComponents: prev.selectedComponents.filter(c => c.id !== componentId)
      }));
    } else {
      const updated = formData.selectedComponents.map(comp =>
        comp.id === componentId ? { ...comp, quantity: newQuantity } : comp
      );
      setFormData(prev => ({ ...prev, selectedComponents: updated }));
    }
  };

  const removeComponent = (componentId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedComponents: prev.selectedComponents.filter(c => c.id !== componentId)
    }));
  };

  // ✅ FIXED: Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerFirstName.trim()) {
      newErrors.customerFirstName = 'First name is required';
    }
    if (!formData.customerLastName.trim()) {
      newErrors.customerLastName = 'Last name is required';
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Please enter a valid email address';
      }
    }
    if (formData.selectedComponents.length === 0) {
      newErrors.selectedComponents = 'Please select at least one component from inventory';
    }
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('✅ Submitting order with components:', formData.selectedComponents);
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof NewOrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Customer Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.customerFirstName}
                onChange={(e) => handleInputChange('customerFirstName', e.target.value)}
                className={`mt-1 ${errors.customerFirstName ? 'border-red-500' : ''}`}
                placeholder="Enter first name"
              />
              {errors.customerFirstName && (
                <p className="text-red-500 text-xs mt-1">{errors.customerFirstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.customerLastName}
                onChange={(e) => handleInputChange('customerLastName', e.target.value)}
                className={`mt-1 ${errors.customerLastName ? 'border-red-500' : ''}`}
                placeholder="Enter last name"
              />
              {errors.customerLastName && (
                <p className="text-red-500 text-xs mt-1">{errors.customerLastName}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              className={`mt-1 ${errors.customerEmail ? 'border-red-500' : ''}`}
              placeholder="customer@example.com"
            />
            {errors.customerEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              className="mt-1"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* ✅ COMPLETELY REPLACED: Search for Components (NO DROPDOWN!) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Search & Select Components</h3>
            <Badge variant="secondary" className="px-3 py-1">
              <ShoppingCart className="h-3 w-3 mr-1" />
              {formData.selectedComponents.length} items selected
            </Badge>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Search Components from Inventory:
            </Label>
            <ComponentSearch onComponentSelect={handleComponentSelect} />
            {errors.selectedComponents && (
              <p className="text-red-500 text-xs mt-2">{errors.selectedComponents}</p>
            )}
            
            <div className="mt-3 text-xs text-gray-500">
              💡 Type to search: processor, graphics, memory, storage, motherboard, psu
            </div>
          </div>

          {/* ✅ FIXED: Selected Components Display */}
          {formData.selectedComponents.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Selected Components:</h4>
              {formData.selectedComponents.map((component) => (
                <div key={component.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{component.name}</p>
                    <p className="text-sm text-gray-600">
                      {component.type} {component.brand && `• ${component.brand}`} {component.model && `• ${component.model}`}
                    </p>
                    <p className="text-sm font-semibold text-green-600">${component.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Qty:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={component.quantity}
                        onChange={(e) => handleQuantityChange(component.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                    </div>
                    <p className="font-semibold text-gray-900 min-w-[80px] text-right">
                      ${(component.price * component.quantity).toFixed(2)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeComponent(component.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* ✅ FIXED: Total Amount Display */}
              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-semibold text-gray-900">Total Order Amount:</span>
                <span className="text-xl font-bold text-blue-600">${formData.totalAmount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special requirements or notes..."
              className="mt-1 min-h-[60px]"
            />
          </div>

          <div>
            <Label htmlFor="shippingAddress">Shipping Address *</Label>
            <Textarea
              id="shippingAddress"
              value={formData.shippingAddress}
              onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              placeholder="Full shipping address including city, state, and zip code"
              className={`mt-1 min-h-[100px] ${errors.shippingAddress ? 'border-red-500' : ''}`}
            />
            {errors.shippingAddress && (
              <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>
            )}
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="w-full sm:w-auto" 
          disabled={isLoading || formData.selectedComponents.length === 0}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating Order...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Order ({formData.selectedComponents.length} components - ${formData.totalAmount})
            </>
          )}
        </Button>
      </div>
    </form>
  );
}