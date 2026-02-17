# Déploiement sur OVH

## 🎯 Options OVH

### Option A - VPS OVH (Recommandé)
- VPS SSD 2 : 10€/mois
- Contrôle total
- Node.js 18+ facile à installer
- MySQL 8.0

### Option B - Cloud Web OVH
- Cloud Web Perso : 3,99€/mois
- Node.js pré-installé
- MySQL inclus
- Configuration simplifiée

## 📋 Étapes de déploiement

### 1. Créer le serveur OVH
1. Connectez-vous à votre manager OVH
2. Choisissez VPS ou Cloud Web
3. Configurez avec Ubuntu 22.04 LTS

### 2. Installation (VPS)
```bash
# Mise à jour
sudo apt update && sudo apt upgrade -y

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL 8
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Créer la base
mysql -u root -p
CREATE DATABASE arbre_genealogique;
CREATE USER 'arbre_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON arbre_genealogique.* TO 'arbre_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Déploiement
```bash
# Clonez ou uploadez les fichiers
git clone votre_repo
cd arbre-genealogique

# Configurez l'environnement
cp .env.example .env
nano .env

# Installez et démarrez
npm install
npm run build
npm start
```

### 4. Variables d'environnement OVH
```bash
NODE_ENV=production
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=arbre_user
MYSQL_PASSWORD=votre_mot_de_passe
MYSQL_DATABASE=arbre_genealogique
JWT_SECRET=votre_secret_32_caracteres
CLIENT_URL=https://votredomaine.ovh
```

## 🔧 Configuration du domaine

1. Dans le manager OVH, ajoutez votre domaine
2. Pointez vers l'IP du VPS
3. Configurez Nginx/Apache pour reverse proxy

## 🚀 Démarrage automatique

```bash
# Avec PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```
