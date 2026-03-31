# Guide de Déploiement VPS Ubuntu - Arbre Généalogique

## 🎯 Vue d'ensemble

Ce guide vous aide à déployer l'application Arbre Généalogique sur un VPS Ubuntu avec :
- ✅ Backend Node.js avec PM2
- ✅ Frontend React build
- ✅ Nginx comme reverse proxy
- ✅ MongoDB comme base de données
- ✅ SSL avec Let's Encrypt (optionnel)

---

## 📋 Prérequis

1. **VPS Ubuntu 20.04 ou 22.04** avec accès SSH
2. **Nom de domaine** (optionnel mais recommandé)
3. **Accès root** ou sudo sur le VPS

---

## 🚀 Étape 1 : Configuration Initiale du VPS

### 1.1 Connexion au VPS
```bash
ssh root@VOTRE_IP_VPS
```

### 1.2 Exécuter le script de setup
```bash
# Télécharger et exécuter le script
curl -fsSL https://raw.githubusercontent.com/bass1012/arbre-genealogique/main/deployment-vps/setup-vps.sh | bash

# Ou manuellement :
apt-get update && apt-get upgrade -y
apt-get install -y nodejs npm nginx git
npm install -g pm2
```

---

## 📦 Étape 2 : Déploiement de l'Application

### 2.1 Cloner le repository
```bash
cd /var/www
mkdir -p arbre-genealogique
cd arbre-genealogique
git clone https://github.com/bass1012/arbre-genealogique.git .
```

### 2.2 Configuration du Backend

Créer le fichier `/var/www/arbre-genealogique/server/.env` :

```env
NODE_ENV=production
PORT=5000

# MongoDB (recommandé pour ce projet)
MONGODB_URI=mongodb://localhost:27017/arbre_genealogique

# JWT
JWT_SECRET=votre_secret_tres_long_et_aleatoire_123456789

# CORS (si nécessaire)
CORS_ORIGIN=*
```

### 2.3 Installation des dépendances

```bash
# Backend
cd /var/www/arbre-genealogique/server
npm install
npm run build

# Frontend
cd /var/www/arbre-genealogique/client
npm install
npm run build
```

---

## ⚡ Étape 3 : Configuration PM2

### 3.1 Créer le fichier ecosystem.config.js
```bash
cd /var/www/arbre-genealogique/server
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
    max_restarts: 10
  }]
};
EOF
```

### 3.2 Démarrer l'application
```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

---

## 🌐 Étape 4 : Configuration Nginx

### 4.1 Créer la configuration
```bash
cat > /etc/nginx/sites-available/arbre-genealogique << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/arbre-genealogique/client/build;
        try_files $uri /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    error_log /var/log/nginx/arbre-error.log;
    access_log /var/log/nginx/arbre-access.log;
}
EOF
```

### 4.2 Activer la configuration
```bash
ln -s /etc/nginx/sites-available/arbre-genealogique /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## 🔐 Étape 5 : SSL avec Let's Encrypt (Optionnel mais recommandé)

```bash
# Installer Certbot
apt-get install -y certbot python3-certbot-nginx

# Obtenir le certificat
certbot --nginx -d votre-domaine.com

# Renouvellement automatique
certbot renew --dry-run
```

---

## 👤 Étape 6 : Création du Compte Admin

```bash
cd /var/www/arbre-genealogique/server
node dist/scripts/createAdmin.js
```

Ou créer manuellement via l'API :
```bash
curl -X POST http://VOTRE_IP/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bassirou2010@gmail.com",
    "password": "Keep0ut@2026!",
    "nom": "OUEDRAOGO",
    "prenom": "Bassirou"
  }'
```

---

## 🔧 Commandes de Maintenance

### Voir les logs
```bash
pm2 logs arbre-genealogique-api
```

### Redémarrer l'application
```bash
pm2 restart arbre-genealogique-api
```

### Mettre à jour l'application
```bash
cd /var/www/arbre-genealogique
git pull

# Mettre à jour le backend
cd server
npm install
npm run build
pm2 restart arbre-genealogique-api

# Mettre à jour le frontend
cd ../client
npm install
npm run build
```

### Vérifier l'état
```bash
pm2 status
pm2 monit
```

---

## 🌐 Accès à l'Application

Une fois déployé :
- **Frontend** : http://VOTRE_IP_VPS
- **API** : http://VOTRE_IP_VPS/api
- **Connexion** : bassirou2010@gmail.com / Keep0ut@2026!

---

## ❌ Dépannage

### Problème : Le serveur ne démarre pas
```bash
# Vérifier les logs
pm2 logs

# Vérifier le port
netstat -tlnp | grep 5000

# Vérifier MongoDB
systemctl status mongod
mongo --eval "db.adminCommand('ping')"
```

### Problème : Nginx erreur 502
```bash
# Vérifier que le backend tourne
pm2 status

# Vérifier la configuration Nginx
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### Problème : CORS
Modifier le fichier `/var/www/arbre-genealogique/server/.env` :
```env
CORS_ORIGIN=http://VOTRE_IP_VPS
```

---

## 📞 Support

En cas de problème, vérifiez :
1. Les logs PM2 : `pm2 logs`
2. Les logs Nginx : `tail -f /var/log/nginx/error.log`
3. Les logs système : `journalctl -u nginx`

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur votre VPS Ubuntu !
