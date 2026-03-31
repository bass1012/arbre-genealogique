#!/bin/bash
# setup-vps.sh - Script d'installation automatique pour VPS Ubuntu
# À exécuter sur votre serveur Ubuntu

set -e

echo "🚀 Configuration du VPS Ubuntu pour Arbre Généalogique"
echo "=================================================="

# 1. Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Installation de Node.js 18.x
echo "🟢 Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installation de PM2
echo "⚡ Installation de PM2..."
sudo npm install -g pm2

# 4. Installation de Nginx
echo "🌐 Installation de Nginx..."
sudo apt-get install -y nginx

# 5. Installation de MongoDB (optionnel - si vous voulez utiliser MongoDB)
echo "🍃 Installation de MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 6. Installation de MySQL (optionnel - si vous voulez utiliser MySQL)
echo "🐬 Installation de MySQL..."
sudo apt-get install -y mysql-server
sudo mysql_secure_installation

# 7. Installation de Git
echo "📁 Installation de Git..."
sudo apt-get install -y git

# 8. Création du dossier pour l'application
echo "📂 Création du dossier application..."
sudo mkdir -p /var/www/arbre-genealogique
sudo chown -R $USER:$USER /var/www/arbre-genealogique

# 9. Configuration du firewall
echo "🔥 Configuration du firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000/tcp  # Port du backend
sudo ufw --force enable

echo ""
echo "✅ Configuration de base terminée !"
echo ""
echo "Prochaines étapes :"
echo "1. Clonez votre repository : cd /var/www/arbre-genealogique && git clone <votre-repo> ."
echo "2. Configurez les variables d'environnement"
echo "3. Déployez avec : ./deploy-to-vps.sh"
