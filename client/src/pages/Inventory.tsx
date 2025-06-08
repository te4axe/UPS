import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Package, Edit, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Component {
  id: number;
  reference: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  stockQuantity: number;
  minStockLevel: number;
  price: string;
  location?: string;
  specifications?: any;
  createdAt: string;
}

interface ComponentStats {
  total: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export default function Inventory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, notes: "" });

  const { data: components, isLoading } = useQuery<Component[]>({
    queryKey: ["/api/components"],
    retry: false,
  });

  const { data: stats } = useQuery<ComponentStats>({
    queryKey: ["/api/components/stats"],
    retry: false,
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ componentId, quantity, notes }: { componentId: number; quantity: number; notes: string }) => {
      return await apiRequest("PATCH", `/api/components/${componentId}/stock`, { quantity, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      queryClient.invalidateQueries({ queryKey: ["/api/components/stats"] });
      setIsStockUpdateOpen(false);
      setStockAdjustment({ quantity: 0, notes: "" });
      toast({
        title: "Success",
        description: "Stock updated successfully",
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

  const createComponentMutation = useMutation({
    mutationFn: async (componentData: any) => {
      return await apiRequest("POST", "/api/components", componentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      queryClient.invalidateQueries({ queryKey: ["/api/components/stats"] });
      setIsDialogOpen(false);
      toast({
        title: "Succès",
        description: "Composant ajouté avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateComponentMutation = useMutation({
    mutationFn: async ({ componentId, updates }: { componentId: number; updates: any }) => {
      return await apiRequest("PATCH", `/api/components/${componentId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      queryClient.invalidateQueries({ queryKey: ["/api/components/stats"] });
      setIsEditDialogOpen(false);
      setSelectedComponent(null);
      toast({
        title: "Succès",
        description: "Composant mis à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredComponents = components?.filter(component => {
    const matchesSearch = 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || component.type === typeFilter;
    
    const matchesStock = 
      stockFilter === "all" ||
      (stockFilter === "low" && component.stockQuantity <= component.minStockLevel) ||
      (stockFilter === "out" && component.stockQuantity === 0) ||
      (stockFilter === "good" && component.stockQuantity > component.minStockLevel);
    
    return matchesSearch && matchesType && matchesStock;
  }) || [];

  const getStockStatus = (component: Component) => {
    if (component.stockQuantity === 0) return "out";
    if (component.stockQuantity <= component.minStockLevel) return "low";
    return "good";
  };

  const getStockBadge = (component: Component) => {
    const status = getStockStatus(component);
    
    switch (status) {
      case "out":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Out of Stock
        </Badge>;
      case "low":
        return <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>;
      default:
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          In Stock
        </Badge>;
    }
  };

  const handleStockUpdate = (component: Component) => {
    setSelectedComponent(component);
    setIsStockUpdateOpen(true);
  };

  const handleComponentEdit = (component: Component) => {
    setSelectedComponent(component);
    setIsEditDialogOpen(true);
  };

  const submitStockUpdate = () => {
    if (selectedComponent && stockAdjustment.quantity !== 0) {
      updateStockMutation.mutate({
        componentId: selectedComponent.id,
        quantity: selectedComponent.stockQuantity + stockAdjustment.quantity,
        notes: stockAdjustment.notes
      });
    }
  };

  const submitComponentUpdate = (formData: any) => {
    if (selectedComponent) {
      updateComponentMutation.mutate({
        componentId: selectedComponent.id,
        updates: formData
      });
    }
  };

  // Check if user has inventory management permissions
  const canManageInventory = user?.role === 'admin' || user?.role === 'stock_manager';
  const canViewInventory = user?.role === 'admin' || user?.role === 'stock_manager' || user?.role === 'receptionist';

  if (!user) return null;
  
  // Restrict access - only admin, stock_manager, and receptionist can view inventory
  if (!canViewInventory) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accès non autorisé</h3>
            <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à l'inventaire.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage component stock levels</p>
        </div>
        
        {canManageInventory && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Component</DialogTitle>
                <DialogDescription>
                  Add a new component to the inventory system
                </DialogDescription>
              </DialogHeader>
              <ComponentForm
                onSubmit={(data) => createComponentMutation.mutate(data)}
                isLoading={createComponentMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Components</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous Types</SelectItem>
                <SelectItem value="CPU">CPU</SelectItem>
                <SelectItem value="GPU">GPU</SelectItem>
                <SelectItem value="Memory">Memory</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Motherboard">Motherboard</SelectItem>
                <SelectItem value="Power Supply">Power Supply</SelectItem>
                <SelectItem value="Case">Case</SelectItem>
                <SelectItem value="Cooling">Cooling</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="good">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Components List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading components...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredComponents.map((component) => (
            <Card key={component.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="font-semibold text-lg">{component.name}</h3>
                      {getStockBadge(component)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Référence:</span> {component.reference}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span> {component.type}
                      </p>
                      <p>
                        <span className="font-medium">Stock:</span> {component.stockQuantity} unités
                      </p>
                      <p>
                        <span className="font-medium">Prix:</span> €{component.price}
                      </p>
                      <p>
                        <span className="font-medium">Emplacement:</span> {component.location || 'Non défini'}
                      </p>
                    </div>
                  </div>

                  {canManageInventory && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockUpdate(component)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier Stock
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleComponentEdit(component)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier Infos
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredComponents.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
                <p className="text-gray-600">
                  {components?.length === 0 
                    ? "No components have been added yet." 
                    : "No components match your current filters."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stock Update Dialog */}
      <Dialog open={isStockUpdateOpen} onOpenChange={setIsStockUpdateOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
            <DialogDescription>
              Adjust stock quantity for {selectedComponent?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Current Stock: {selectedComponent?.stockQuantity} units</Label>
            </div>
            
            <div>
              <Label htmlFor="adjustment">Stock Adjustment</Label>
              <Input
                id="adjustment"
                type="number"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                placeholder="Enter positive or negative number"
              />
              <p className="text-xs text-gray-500 mt-1">
                New stock level: {(selectedComponent?.stockQuantity || 0) + stockAdjustment.quantity}
              </p>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={stockAdjustment.notes}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Reason for adjustment..."
              />
            </div>
            
            <Button 
              onClick={submitStockUpdate} 
              className="w-full"
              disabled={updateStockMutation.isPending || stockAdjustment.quantity === 0}
            >
              {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Component Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le Composant</DialogTitle>
            <DialogDescription>
              Modifiez les informations pour {selectedComponent?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedComponent && (
            <EditComponentForm 
              component={selectedComponent}
              onSubmit={submitComponentUpdate} 
              isLoading={updateComponentMutation.isPending} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component Form for Adding New Components
function ComponentForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    stockQuantity: 0,
    minStockLevel: 5,
    price: '0.00',
    location: '',
    specifications: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform data to match server expectations
    const transformedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stockQuantity: parseInt(formData.stockQuantity.toString()) || 0,
      minStockLevel: parseInt(formData.minStockLevel.toString()) || 5,
      specifications: formData.specifications || null
    };
    
    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Component Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select component type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CPU">CPU</SelectItem>
            <SelectItem value="GPU">GPU</SelectItem>
            <SelectItem value="Memory">Memory</SelectItem>
            <SelectItem value="Storage">Storage</SelectItem>
            <SelectItem value="Motherboard">Motherboard</SelectItem>
            <SelectItem value="Power Supply">Power Supply</SelectItem>
            <SelectItem value="Case">Case</SelectItem>
            <SelectItem value="Cooling">Cooling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stockQuantity">Initial Stock</Label>
          <Input
            id="stockQuantity"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="minStockLevel">Min Stock Level</Label>
          <Input
            id="minStockLevel"
            type="number"
            value={formData.minStockLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 0 }))}
            min="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Marque</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="model">Modèle</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Emplacement</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Ex: A1-B2, Entrepôt Nord"
        />
      </div>

      <div>
        <Label htmlFor="specifications">Spécifications</Label>
        <Textarea
          id="specifications"
          value={formData.specifications}
          onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
          placeholder="Caractéristiques techniques du composant"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Component"}
      </Button>
    </form>
  );
}

// Edit Component Form
function EditComponentForm({ component, onSubmit, isLoading }: { component: Component; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    name: component.name || '',
    type: component.type || '',
    brand: component.brand || '',
    model: component.model || '',
    price: component.price || '',
    location: component.location || '',
    specifications: component.specifications || '',
    minStockLevel: component.minStockLevel || 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Nom du Composant</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CPU">CPU</SelectItem>
            <SelectItem value="GPU">GPU</SelectItem>
            <SelectItem value="Memory">Mémoire</SelectItem>
            <SelectItem value="Storage">Stockage</SelectItem>
            <SelectItem value="Motherboard">Carte Mère</SelectItem>
            <SelectItem value="Power Supply">Alimentation</SelectItem>
            <SelectItem value="Case">Boîtier</SelectItem>
            <SelectItem value="Cooling">Refroidissement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-brand">Marque</Label>
          <Input
            id="edit-brand"
            value={formData.brand}
            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="edit-model">Modèle</Label>
          <Input
            id="edit-model"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-price">Prix (€)</Label>
          <Input
            id="edit-price"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="edit-minStock">Niveau Min de Stock</Label>
          <Input
            id="edit-minStock"
            type="number"
            value={formData.minStockLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 5 }))}
            min="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit-location">Emplacement</Label>
        <Input
          id="edit-location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Ex: A1-B2, Entrepôt Nord"
        />
      </div>

      <div>
        <Label htmlFor="edit-specifications">Spécifications</Label>
        <Textarea
          id="edit-specifications"
          value={formData.specifications}
          onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
          placeholder="Caractéristiques techniques du composant"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Mise à jour..." : "Mettre à jour"}
      </Button>
    </form>
  );
}