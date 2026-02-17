#!/bin/bash

# Script de déploiement pour VPS LWS
set -e

echo "🚀 Déploiement de l'arbre généalogique..."

# Variables
REPO_URL="votre-repo-git.git"
DEPLOY_DIR="/var/www/arbre-genealogique"
BACKUP_DIR="/var/www/backups"

# Créer backup
echo "📦 Création du backup..."
mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" $DEPLOY_DIR

# Cloner/Mettre à jour le code
echo "📥 Récupération du code..."
if [ -d "$DEPLOY_DIR" ]; then
    cd $DEPLOY_DIR
    git pull origin main
else
    git clone $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
cd server
npm ci --production
npm run build

cd ../client
npm ci
npm run build

# Configurer PM2
echo "⚙️ Configuration de PM2..."
pm2 delete arbre-genealogique 2>/dev/null || true
pm2 start ecosystem.config.js --env production

echo "✅ Déploiement terminé !"
echo "🌐 Application disponible sur votre domaine"
