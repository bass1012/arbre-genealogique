#!/bin/bash
# deploy-vps-57.131.47.244.sh - Script de déploiement complet pour VPS 57.131.47.244
# À exécuter sur le VPS Ubuntu

set -e

VPS_IP="57.131.47.244"
APP_DIR="/var/www/arbre-genealogique"

echo "🚀 Déploiement sur VPS: $VPS_IP"
echo "================================"

# 1. Mise à jour système
echo "📦 Mise à jour du système..."
apt-get update && apt-get upgrade -y

# 2. Installation Node.js
echo "🟢 Installation Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Installation PM2 et Nginx
echo "⚡ Installation PM2 et Nginx..."
npm install -g pm2
apt-get install -y nginx git

# 4. Installation MongoDB
echo "🍃 Installation MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# 5. Cloner le projet
echo "📂 Clonage du projet..."
mkdir -p $APP_DIR
cd $APP_DIR

# Si le dossier existe déjà, le supprimer
if [ -d ".git" ]; then
    echo "Projet existant trouvé, mise à jour..."
    git pull
else
    git clone https://github.com/bass1012/arbre-genealogique.git .
fi

# 6. Configuration Backend
echo "🔧 Configuration Backend..."
cd $APP_DIR/server

# Créer .env
cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arbre_genealogique
JWT_SECRET=arbre_genealogique_secret_key_$(date +%s)
CORS_ORIGIN=http://$VPS_IP
EOF

npm install
npm run build

# 7. Configuration Frontend
echo "🎨 Configuration Frontend..."
cd $APP_DIR/client

# Créer .env.production
cat > .env.production << EOF
REACT_APP_API_URL=http://$VPS_IP:5000
EOF

npm install
npm run build

# 8. Création de l'admin
echo "👤 Création du compte admin..."
cd $APP_DIR/server
node dist/scripts/createAdmin.js || echo "Admin peut déjà exister"

# 9. Configuration Nginx
echo "🌐 Configuration Nginx..."
cat > /etc/nginx/sites-available/arbre-genealogique << EOF
server {
    listen 80;
    server_name $VPS_IP;

    # Frontend
    location / {
        root $APP_DIR/client/build;
        try_files \$uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

ln -sf /etc/nginx/sites-available/arbre-genealogique /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 10. Firewall
echo "🔥 Configuration Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 5000/tcp
ufw --force enable

# 11. PM2
echo "⚡ Configuration PM2..."
cd $APP_DIR/server

cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'arbre-genealogique-api',
    script: './dist/index.js',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    time: true,
    autorestart: true
  }]
};
EOF

mkdir -p logs
pm2 delete arbre-genealogique-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "✅ DÉPLOIEMENT TERMINÉ !"
echo "========================"
echo ""
echo "🌐 Accès: http://$VPS_IP"
echo "📧 Login: bassirou2010@gmail.com"
echo "🔑 Password: Keep0ut@2026!"
echo ""
echo "Commandes utiles:"
echo "  pm2 logs              # Voir les logs"
echo "  pm2 restart all       # Redémarrer"
echo "  systemctl status nginx # Statut Nginx"
