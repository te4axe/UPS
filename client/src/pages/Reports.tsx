import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Reports() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Données simulées pour les graphiques
  const monthlyOrders = [
    { month: 'Jan', orders: 65 },
    { month: 'Fév', orders: 78 },
    { month: 'Mar', orders: 90 },
    { month: 'Avr', orders: 81 },
    { month: 'Mai', orders: 95 },
    { month: 'Jun', orders: 87 }
  ];

  const componentUsage = [
    { name: 'Processeurs', usage: 45 },
    { name: 'Cartes Graphiques', usage: 38 },
    { name: 'Mémoire RAM', usage: 52 },
    { name: 'Stockage', usage: 41 },
    { name: 'Cartes Mères', usage: 35 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orders?.total || 0}</div>
            <p className="text-xs text-muted-foreground">+12% ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orders?.inProduction || 0}</div>
            <p className="text-xs text-muted-foreground">Actuellement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.revenue?.toLocaleString() || 0}€</div>
            <p className="text-xs text-muted-foreground">+8% ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Composants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.components?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Total en stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commandes par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisation des Composants</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={componentUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statut des Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>En Attente</span>
                <span className="font-semibold">15</span>
              </div>
              <div className="flex justify-between">
                <span>En Production</span>
                <span className="font-semibold">{stats?.orders?.inProduction || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Terminées</span>
                <span className="font-semibold">142</span>
              </div>
              <div className="flex justify-between">
                <span>Expédiées</span>
                <span className="font-semibold">128</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Critique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Stock Faible</span>
                <span className="font-semibold text-yellow-600">{stats?.components?.lowStock || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Rupture de Stock</span>
                <span className="font-semibold text-red-600">{stats?.components?.outOfStock || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Stock Normal</span>
                <span className="font-semibold text-green-600">
                  {(stats?.components?.total || 0) - (stats?.components?.lowStock || 0) - (stats?.components?.outOfStock || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}