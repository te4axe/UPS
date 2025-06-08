import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";

export default function Reports() {
  const { data: dashboardStats, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
      return response.json();
    },
  });

  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des commandes');
      return response.json();
    },
  });

  const { data: components, isLoading: isComponentsLoading } = useQuery({
    queryKey: ["/api/components"],
    queryFn: async () => {
      const response = await fetch("/api/components", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des composants');
      return response.json();
    },
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      return response.json();
    },
  });

  if (isDashboardLoading || isOrdersLoading || isComponentsLoading || isUsersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Analyse des données réelles
  const ordersByStatus = orders?.reduce((acc: any, order: any) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const orderStatusData = Object.entries(ordersByStatus).map(([status, count]) => ({
    status: status.replace('_', ' ').toUpperCase(),
    count
  }));

  const componentsByType = components?.reduce((acc: any, component: any) => {
    acc[component.type] = (acc[component.type] || 0) + 1;
    return acc;
  }, {}) || {};

  const componentTypeData = Object.entries(componentsByType).map(([type, count]) => ({
    type,
    count
  }));

  const lowStockComponents = components?.filter((comp: any) => 
    comp.stockQuantity <= (comp.minStockLevel || 5)
  ) || [];

  const usersByRole = users?.reduce((acc: any, user: any) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {}) || {};

  const userRoleData = Object.entries(usersByRole).map(([role, count]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    count
  }));

  const recentOrders = orders?.slice(0, 5) || [];
  const totalRevenue = orders?.reduce((sum: number, order: any) => 
    sum + parseFloat(order.totalAmount || 0), 0) || 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Depuis le début</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Employés actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()}€</div>
            <p className="text-xs text-muted-foreground">Total des ventes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockComponents.length}</div>
            <p className="text-xs text-muted-foreground">Composants à réapprovisionner</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statut des Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Types de Composants</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={componentTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userRoleData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="role" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composants en Stock Faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {lowStockComponents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun composant en stock faible
                </p>
              ) : (
                lowStockComponents.map((component: any) => (
                  <div key={component.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{component.name}</p>
                      <p className="text-xs text-muted-foreground">{component.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{component.stockQuantity}</p>
                      <p className="text-xs text-muted-foreground">en stock</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune commande enregistrée
                </p>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{parseFloat(order.totalAmount || 0).toLocaleString()}€</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'created' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}