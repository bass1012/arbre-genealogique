#!/bin/bash
# deploy-to-vps.sh - Script de déploiement automatique
# À exécuter sur votre machine locale ou le VPS

set -e

# Configuration - MODIFIEZ CES VARIABLES
VPS_IP="YOUR_VPS_IP"
VPS_USER="root"  # ou votre utilisateur
APP_DIR="/var/www/arbre-genealogique"
REPO_URL="https://github.com/bass1012/arbre-genealogique.git"

echo "🚀 Déploiement sur VPS Ubuntu"
echo "============================"
echo "VPS: $VPS_IP"
echo "Répertoire: $APP_DIR"
echo ""

# 1. Connexion au VPS et déploiement
echo "📤 Envoi des fichiers sur le VPS..."

# Si vous exécutez ce script localement avec accès SSH :
# rsync -avz --exclude 'node_modules' --exclude '.git' ./ $VPS_USER@$VPS_IP:$APP_DIR/

# Sur le VPS, exécutez ces commandes :
echo ""
echo "⚙️  Installation des dépendances..."

# Backend
cd $APP_DIR/server
npm install

# Frontend
cd $APP_DIR/client
npm install
npm run build

# 2. Configuration du backend
echo ""
echo "🔧 Configuration du backend..."
cd $APP_DIR/server

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arbre_genealogique
JWT_SECRET=votre_secret_jwt_tres_securise_$(date +%s)
EOF
    echo "✅ Fichier .env créé"
fi

# 3. Création de l'admin
echo ""
echo "👤 Création du compte administrateur..."
cd $APP_DIR/server
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre_genealogique');
    
    const adminExists = await User.findOne({ email: 'bassirou2010@gmail.com' });
    if (adminExists) {
      console.log('✅ Admin déjà existant');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('Keep0ut@2026!', 10);
    
    const admin = new User({
      email: 'bassirou2010@gmail.com',
      password: hashedPassword,
      nom: 'OUEDRAOGO',
      prenom: 'Bassirou',
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Admin créé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createAdmin();
" 2>/dev/null || echo "⚠️  Création admin manuelle nécessaire"

# 4. Configuration Nginx
echo ""
echo "🌐 Configuration Nginx..."
sudo tee /etc/nginx/sites-available/arbre-genealogique > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;  # Accepte toutes les requêtes

    # Frontend (React build)
    location / {
        root /var/www/arbre-genealogique/client/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Logs
    error_log /var/log/nginx/arbre-error.log;
    access_log /var/log/nginx/arbre-access.log;
}
EOF

# Activer la configuration
sudo ln -sf /etc/nginx/sites-available/arbre-genealogique /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 5. Démarrage avec PM2
echo ""
echo "⚡ Démarrage avec PM2..."
cd $APP_DIR/server

# Créer ecosystem.config.js pour PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'arbre-genealogique-api',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Build du serveur
npm run build

# Créer le dossier logs
mkdir -p logs

# Démarrer ou redémarrer l'application
pm2 delete arbre-genealogique-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📊 Statut PM2:"
pm2 status
echo ""
echo "🔗 Votre application est accessible sur:"
echo "   http://$VPS_IP"
echo ""
echo "📋 Commandes utiles:"
echo "   pm2 logs arbre-genealogique-api  # Voir les logs"
echo "   pm2 restart arbre-genealogique-api # Redémarrer"
echo "   pm2 stop arbre-genealogique-api    # Arrêter"
