#!/bin/bash

# Script de déploiement automatique pour VPS
# À exécuter sur le serveur VPS

set -e  # Arrêter si une commande échoue

echo "🚀 Démarrage du déploiement..."

# Configuration
PROJECT_DIR="/var/www/arbre-genealogique"
cd "$PROJECT_DIR"

echo "📦 Étape 1/6 : Mise à jour du code source..."
git pull origin main

echo "⚙️  Étape 2/6 : Configuration du serveur..."
# Créer .env s'il n'existe pas
if [ ! -f "server/.env" ]; then
    cat > server/.env << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arbre-genealogique
JWT_SECRET=changez_ce_secret_en_production_12345678901234567890
JWT_EXPIRES_IN=30d
CLIENT_URL=*
CLOUDINARY_CLOUD_NAME=dugtvvrp2
CLOUDINARY_API_KEY=113667211352998
CLOUDINARY_API_SECRET=aTcSqtP6_Jhh3n5LvmPUSDVqeds
EOF
    echo "✅ Fichier .env créé"
else
    echo "✅ Fichier .env existe déjà"
fi

echo "🔨 Étape 3/6 : Build du backend..."
cd server
npm install --production=false
npm run build
cd ..

echo "🎨 Étape 4/6 : Build du frontend..."
cd client
# Créer .env.production s'il n'existe pas
if [ ! -f ".env.production" ]; then
    echo "REACT_APP_API_URL=http://57.131.47.244:5000" > .env.production
fi
npm install --production=false
npm run build
cd ..

echo "🔄 Étape 5/6 : Redémarrage de l'application..."
cd server
pm2 stop arbre-genealogique-api 2>/dev/null || true
pm2 delete arbre-genealogique-api 2>/dev/null || true
pm2 start dist/index.js --name arbre-genealogique-api
pm2 save

echo "📊 Étape 6/6 : Vérification de l'application..."
pm2 status

echo ""
echo "✅ Déploiement terminé avec succès !"
echo ""
echo "📝 Vérifications :"
echo "  - Status PM2 : pm2 status"
echo "  - Logs : pm2 logs arbre-genealogique-api"
echo "  - Test API : curl http://localhost:5000/api/health"
echo "  - Accès Web : http://57.131.47.244"
echo ""
