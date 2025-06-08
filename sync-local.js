#!/usr/bin/env node

/**
 * Script de synchronisation pour mettre à jour votre version locale
 * Exécutez ce script dans votre projet local après avoir copié ce fichier
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Synchronisation des fichiers mis à jour...\n');

// Liste des fichiers modifiés avec leur contenu mis à jour
const updatedFiles = {
  'client/src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Responsive utilities */
@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* Mobile-first responsive text sizing */
  html {
    font-size: 14px;
  }
  
  @media (min-width: 640px) {
    html {
      font-size: 16px;
    }
  }
}

@layer components {
  /* Mobile navigation improvements */
  .mobile-nav {
    @apply fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden;
  }
  
  /* Responsive grid layouts */
  .responsive-grid {
    @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
  }
  
  /* Mobile-friendly cards */
  .mobile-card {
    @apply p-3 sm:p-4 lg:p-6;
  }
  
  /* Responsive sidebar */
  .sidebar {
    @apply w-full sm:w-64 lg:w-72;
  }
  
  /* Touch-friendly buttons */
  .touch-button {
    @apply min-h-[44px] min-w-[44px] touch-manipulation;
  }
}

:root {
  --background: 0 0% 100%;
  --foreground: 20 14.3% 4.1%;
  --muted: 60 4.8% 95.9%;
  --muted-foreground: 25 5.3% 44.7%;
  --popover: 0 0% 100%;
  --popover-foreground: 20 14.3% 4.1%;
  --card: 0 0% 100%;
  --card-foreground: 20 14.3% 4.1%;
  --border: 20 5.9% 90%;
  --input: 20 5.9% 90%;
  --primary: 198 93% 60%; /* Sky blue primary */
  --primary-foreground: 210 40% 98%;
  --secondary: 60 4.8% 95.9%;
  --secondary-foreground: 24 9.8% 10%;
  --accent: 198 93% 60%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 60 9.1% 97.8%;
  --ring: 198 93% 60%;
  --radius: 0.5rem;
  
  /* Custom Ultra PC colors */
  --sky-blue-50: 240 100% 99%; /* #f0f9ff */
  --sky-blue-100: 220 100% 95%; /* #e0f2fe */
  --sky-blue-200: 208 100% 85%; /* #bae6fd */
  --sky-blue-300: 199 95% 74%; /* #7dd3fc */
  --sky-blue-400: 198 93% 60%; /* #38bdf8 */
  --sky-blue-500: 199 89% 48%; /* #0ea5e9 */
  --sky-blue-600: 200 98% 39%; /* #0284c7 */
  --sky-blue-700: 201 96% 32%; /* #0369a1 */
  --sky-blue-800: 201 90% 27%; /* #075985 */
  --sky-blue-900: 202 80% 24%; /* #0c4a6e */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --primary: 198 93% 60%;
  --primary-foreground: 210 40% 98%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 85.7% 97.3%;
  --ring: 198 93% 60%;
}

/* Custom gradients */
.bg-gradient-sky {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
}

.focus-sky:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

/* Loading spinner */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,

  'client/src/hooks/useAuth.ts': `import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérification initiale de l'authentification une seule fois
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        // Ignore les erreurs et reste déconnecté
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

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
      setUser(userData);
      queryClient.invalidateQueries();
      // Force le rechargement de la page pour garantir la redirection
      window.location.href = '/';
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
      setUser(null);
      queryClient.clear();
      // Force le rechargement vers la page de login
      window.location.href = '/login';
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginMutation,
    logoutMutation,
  };
}`
};

// Fonction pour créer les dossiers si nécessaire
function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Fonction pour sauvegarder un fichier
function saveFile(filePath, content) {
  try {
    ensureDirectoryExists(filePath);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(\`✅ \${filePath} - Mis à jour\`);
    return true;
  } catch (error) {
    console.log(\`❌ \${filePath} - Erreur: \${error.message}\`);
    return false;
  }
}

// Traitement des fichiers
let successCount = 0;
let totalFiles = Object.keys(updatedFiles).length;

console.log(\`📁 Traitement de \${totalFiles} fichiers...\n\`);

for (const [filePath, content] of Object.entries(updatedFiles)) {
  if (saveFile(filePath, content)) {
    successCount++;
  }
}

console.log(\`\n📊 Résultat: \${successCount}/\${totalFiles} fichiers mis à jour avec succès\`);

if (successCount === totalFiles) {
  console.log(\`\n🎉 Synchronisation terminée avec succès!\`);
  console.log(\`\n📋 Prochaines étapes:\`);
  console.log(\`   1. npm install\`);
  console.log(\`   2. npm run dev\`);
  console.log(\`\n✨ Votre projet est maintenant à jour avec toutes les améliorations!\`);
} else {
  console.log(\`\n⚠️  Certains fichiers n'ont pas pu être mis à jour.\`);
  console.log(\`   Vérifiez les permissions et réessayez.\`);
}