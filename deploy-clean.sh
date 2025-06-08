#!/bin/bash
# Script de déploiement Ultra PC System v3.0

echo "🚀 Déploiement Ultra PC System v3.0..."

# Remplacement du package.json
echo "📦 Mise à jour package.json..."
cp package-clean.json package.json

# Nettoyage complet des caches
echo "🧹 Nettoyage des caches..."
rm -rf node_modules package-lock.json
rm -rf .cache dist

# Réinstallation complète
echo "⚡ Installation des dépendances..."
npm install

# Démarrage
echo "🎯 Démarrage du serveur v3.0..."
npm run dev