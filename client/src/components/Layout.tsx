import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Cpu, 
  Menu, 
  X,
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart3,
  LogOut,
  Bell,
  Key,
  User,
  ChevronDown
} from "lucide-react";
import Notifications from "./Notifications";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const navigation = [
    { name: "Vue d'ensemble", href: "/", icon: LayoutDashboard, roles: ["admin", "receptionist", "stock_manager", "assembly", "packaging", "shipping"] },
    { name: "Gestion des Commandes", href: "/orders", icon: ShoppingCart, roles: ["admin", "receptionist", "stock_manager", "assembly", "packaging", "shipping"] },
    { name: "Gestion des Utilisateurs", href: "/users", icon: Users, roles: ["admin"] },
    { name: "Inventaire", href: "/inventory", icon: Package, roles: ["admin", "stock_manager", "receptionist"] },
    { name: "Rapports", href: "/reports", icon: BarChart3, roles: ["admin"] },
  ];

  const filteredNavigation = navigation.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Mot de passe modifié avec succès",
        });
        setPasswordDialogOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.text();
        toast({
          title: "Erreur",
          description: error || "Impossible de modifier le mot de passe",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-center h-16 bg-sky-blue-500 text-white">
          <Cpu className="w-6 h-6 mr-2" />
          <span className="text-xl font-bold">Ultra PC</span>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 mb-4">
            <div className="flex items-center space-x-3 p-3 bg-sky-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-sky-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 px-4">
            {filteredNavigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sky-blue-50 text-sky-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">
              {filteredNavigation.find(item => item.href === location)?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrateur' :
                   user?.role === 'receptionist' ? 'Réceptionnaire' :
                   user?.role === 'stock_manager' ? 'Gestionnaire Stock' :
                   user?.role === 'assembly' ? 'Employé Montage' :
                   user?.role === 'packaging' ? 'Employé Emballage' :
                   user?.role === 'shipping' ? 'Expéditeur' : user?.role}
                </div>
              </div>
              
              <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-sky-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Changer le mot de passe</DialogTitle>
                    <DialogDescription>
                      Modifiez votre mot de passe actuel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Mot de passe actuel</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handlePasswordChange} className="flex-1">
                        <Key className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
