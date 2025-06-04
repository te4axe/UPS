import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingCart, 
  ServerCog, 
  Truck, 
  DollarSign, 
  ClipboardList,
  Package,
  CheckCircle,
  Dock
} from "lucide-react";

interface OrderStats {
  total: number;
  inProduction: number;
  shippedToday: number;
  revenue: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: orderStats, isLoading: statsLoading } = useQuery<OrderStats>({
    queryKey: ["/api/stats/orders"],
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    select: (data) => data?.slice(0, 5) || [],
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "bg-gray-100 text-gray-800",
      confirmed: "bg-blue-100 text-blue-800",
      components_selected: "bg-yellow-100 text-yellow-800",
      assembly_started: "bg-orange-100 text-orange-800",
      assembly_completed: "bg-purple-100 text-purple-800",
      packaged: "bg-indigo-100 text-indigo-800",
      shipped: "bg-green-100 text-green-800",
      delivered: "bg-emerald-100 text-emerald-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    change 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    change?: string; 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 font-medium">{change}</span>
            <span className="text-gray-600 ml-2">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to Ultra PC Order Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-32 mt-4" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Orders"
              value={orderStats?.total || 0}
              icon={ShoppingCart}
              color="bg-sky-blue-500"
              change="+12%"
            />
            <StatCard
              title="In Production"
              value={orderStats?.inProduction || 0}
              icon={ServerCog}
              color="bg-yellow-500"
            />
            <StatCard
              title="Shipped Today"
              value={orderStats?.shippedToday || 0}
              icon={Truck}
              color="bg-green-500"
            />
            <StatCard
              title="Revenue"
              value={`$${orderStats?.revenue?.toLocaleString() || '0'}`}
              icon={DollarSign}
              color="bg-purple-500"
              change="+8%"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <a href="/orders" className="text-sky-blue-500 hover:text-sky-blue-600 text-sm font-medium">
                View All
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-sky-blue-500 rounded-lg flex items-center justify-center">
                        <Dock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${parseFloat(order.totalAmount).toLocaleString()}
                      </div>
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Production Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Production Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-8 h-8 text-sky-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : '12'}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ServerCog className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : orderStats?.inProduction || 0}
                </div>
                <div className="text-sm text-gray-600">In Assembly</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : '5'}
                </div>
                <div className="text-sm text-gray-600">Packaging</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : '3'}
                </div>
                <div className="text-sm text-gray-600">Ready to Ship</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
