#!/bin/bash
# Script de déploiement automatique pour arbre-genealogique
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🔨 Construction du projet..."
cd "/Users/bassoued/Documents/ARBRE GENEALOGIQUE/arbre-genealogique/client"
REACT_APP_API_URL=https://www.arbre-genealogique.allsite.cloud npm run build

echo "📦 Création de l'archive..."
tar -czf /tmp/build.tar.gz build

echo "📤 Envoi vers le serveur..."
scp /tmp/build.tar.gz ubuntu@57.131.47.244:/tmp/

echo "🚀 Déploiement sur le serveur..."
ssh ubuntu@57.131.47.244 'cd /var/www/arbre-genealogique/client && \
  sudo rm -rf build && \
  sudo tar -xzf /tmp/build.tar.gz && \
  sudo chown -R www-data:www-data build && \
  cd build && \
  sudo rsvg-convert tree-icon.svg -w 32 -h 32 -o favicon-32.png && \
  sudo convert favicon-32.png favicon.ico && \
  sudo rsvg-convert tree-icon.svg -w 192 -h 192 -o logo192.png && \
  sudo rsvg-convert tree-icon.svg -w 512 -h 512 -o logo512.png && \
  sudo sed -i "s|href=\"./|href=\"/|g; s|src=\"./|src=\"/|g" index.html'

echo "✅ Déploiement terminé!"
echo "🌐 https://www.arbre-genealogique.allsite.cloud"
