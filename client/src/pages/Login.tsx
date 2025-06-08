import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Cpu } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
    } catch (error) {
      toast({
        title: "Échec de la connexion",
        description: "Email ou mot de passe invalide. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sky-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Ultra PC</CardTitle>
          <CardDescription className="text-sm sm:text-base">Système de Gestion des Commandes</CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Adresse Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ultrapc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-sky touch-button text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Mot de Passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-sky touch-button text-sm sm:text-base"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-sky-blue-500 hover:bg-sky-blue-600 text-white touch-button text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se Connecter"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>Admin: admin@ultrapc.com / admin123</div>
              <div>Assembly: assembly@ultrapc.com / assembly123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
