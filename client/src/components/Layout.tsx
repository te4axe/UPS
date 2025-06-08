import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  Key,
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
      {/* Mobile/Tablet Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Always visible on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-center h-16 bg-sky-500 text-white">
          <Cpu className="w-6 h-6 mr-2" />
          <span className="text-xl font-bold">Ultra PC</span>
        </div>
        
        <nav className="mt-6 sm:mt-8 h-full overflow-y-auto">
          <div className="px-3 sm:px-4 mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-sky-50 rounded-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-xs sm:text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 capitalize truncate">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-1 sm:space-y-2 px-3 sm:px-4 pb-20">
            {filteredNavigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-colors touch-button ${
                      isActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">{item.name}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100 touch-button text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 sm:lg:ml-72">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden touch-button mr-2 sm:mr-4"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {filteredNavigation.find(item => item.href === location)?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Notifications Component */}
            <Notifications />

            {/* User Menu - Always visible */}
            <div className="flex items-center space-x-2">
              {/* User info - Hidden on mobile */}
              <div className="hidden sm:block text-right">
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
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2 touch-button">
                    <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-medium">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-lg sm:text-xl">Changer le mot de passe</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                      Modifiez votre mot de passe actuel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 p-1">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-sm sm:text-base">Mot de passe actuel</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="touch-button text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm sm:text-base">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="touch-button text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm sm:text-base">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="touch-button text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                      <Button onClick={handlePasswordChange} className="flex-1 touch-button text-sm sm:text-base">
                        <Key className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      <Button variant="outline" onClick={handleLogout} className="flex-1 touch-button text-sm sm:text-base">
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
        <main className="p-3 sm:p-4 lg:p-6 pt-4 sm:pt-6 lg:pt-8 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
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
