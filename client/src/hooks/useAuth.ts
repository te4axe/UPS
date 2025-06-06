import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Utiliser react-query pour gérer l'état d'authentification
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Non authentifié');
        }
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<User> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      return response.json();
    },
    onSuccess: (userData) => {
      // Mettre à jour le cache avec les données utilisateur
      queryClient.setQueryData(["auth", "user"], userData);
      // Invalider toutes les requêtes pour recharger les données
      queryClient.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Erreur de déconnexion');
      }
    },
    onSuccess: () => {
      // Effacer le cache d'authentification
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear();
    },
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginMutation,
    logoutMutation,
  };
}
