import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, Truck, DollarSign, Users, Wrench, Settings, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

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
  const { user } = useAuth();
  
  const { data: stats } = useQuery<OrderStats>({
    queryKey: ["/api/stats/orders"],
    retry: false,
  });

  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    retry: false,
  });

  if (!user) return null;

  // Role-specific dashboard content
  const getRoleSpecificContent = () => {
    switch (user.role) {
      case 'admin':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Orders</CardTitle>
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats?.total || 0}</div>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium truncate">Production</CardTitle>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats?.inProduction || 0}</div>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium truncate">Shipped</CardTitle>
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats?.shippedToday || 0}</div>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium truncate">Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-lg sm:text-2xl font-bold">${stats?.revenue?.toLocaleString() || '0'}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">User Management</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage staff and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/users">
                    <Button className="w-full touch-button text-sm sm:text-base">Manage Users</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">Order Overview</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monitor all orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/orders">
                    <Button className="w-full touch-button text-sm sm:text-base">View All Orders</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="mobile-card sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">System Settings</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configure system preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full touch-button text-sm sm:text-base" variant="outline">Settings</Button>
                </CardContent>
              </Card>
            </div>
          </>
        );

      case 'receptionist':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">Create New Order</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Register new customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/orders">
                  <Button className="w-full touch-button text-sm sm:text-base">New Order</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">Pending Orders</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Orders awaiting confirmation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold mb-2">
                  {recentOrders?.filter(order => order.status === 'created').length || 0}
                </div>
                <Link href="/orders">
                  <Button variant="outline" className="w-full touch-button text-sm sm:text-base">View Orders</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        );

      case 'components':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Component Selection
                </CardTitle>
                <CardDescription>Select components for orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {recentOrders?.filter(order => order.status === 'confirmed').length || 0}
                </div>
                <p className="text-sm text-gray-600 mb-4">Orders need components</p>
                <Link href="/orders">
                  <Button className="w-full">Manage Components</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Status
                </CardTitle>
                <CardDescription>Monitor component stock</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Inventory</Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'assembly':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Ready for Assembly
                </CardTitle>
                <CardDescription>Orders ready to build</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {recentOrders?.filter(order => order.status === 'components_selected').length || 0}
                </div>
                <Link href="/orders">
                  <Button className="w-full">Start Assembly</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  In Progress
                </CardTitle>
                <CardDescription>Currently assembling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {recentOrders?.filter(order => order.status === 'assembly_started').length || 0}
                </div>
                <Link href="/orders">
                  <Button variant="outline" className="w-full">View Progress</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        );

      case 'packaging':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Ready for Packaging
                </CardTitle>
                <CardDescription>Completed assemblies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {recentOrders?.filter(order => order.status === 'assembly_completed').length || 0}
                </div>
                <Link href="/orders">
                  <Button className="w-full">Start Packaging</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Quality Check
                </CardTitle>
                <CardDescription>Final inspection</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">QC Checklist</Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'shipping':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Ready to Ship
                </CardTitle>
                <CardDescription>Packaged orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {recentOrders?.filter(order => order.status === 'packaged').length || 0}
                </div>
                <Link href="/orders">
                  <Button className="w-full">Process Shipping</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Shipped Today
                </CardTitle>
                <CardDescription>Orders dispatched</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {recentOrders?.filter(order => order.status === 'shipped').length || 0}
                </div>
                <Button variant="outline" className="w-full">Shipping Reports</Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <p className="text-gray-600">Bienvenue, {user.firstName}!</p>
        <Badge variant="outline" className="mt-2 capitalize">{user.role}</Badge>
      </div>

      {getRoleSpecificContent()}

      {/* Recent Orders - Show for all roles */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest order activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-2 sm:gap-4">
                <div className="flex-1">
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="font-medium">${order.totalAmount}</span>
                </div>
              </div>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="text-center text-gray-500 py-8">No orders found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}