# 🚀 Redéploiement Rapide - Instructions

## Commandes à exécuter sur votre VPS 57.131.47.244

### Option 1 : Déploiement Automatique (RECOMMANDÉ) ✨

Connectez-vous au VPS et exécutez une seule commande :

```bash
ssh root@57.131.47.244
cd /var/www/arbre-genealogique && git pull origin main && bash deploy-auto.sh
```

**C'est tout !** Le script fait automatiquement :
- ✅ Mise à jour du code
- ✅ Configuration des variables d'environnement
- ✅ Build backend et frontend
- ✅ Redémarrage de l'application

---

### Option 2 : Déploiement Manuel (étape par étape)

Si vous préférez contrôler chaque étape :

#### 1. Connexion au VPS
```bash
ssh root@57.131.47.244
```

#### 2. Aller dans le répertoire du projet
```bash
cd /var/www/arbre-genealogique
```

#### 3. Mettre à jour le code
```bash
git pull origin main
```

#### 4. Configurer le serveur (.env)
```bash
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
```

#### 5. Rebuild du backend
```bash
cd server
npm install
npm run build
cd ..
```

#### 6. Configurer et rebuild du frontend
```bash
cd client
echo "REACT_APP_API_URL=http://57.131.47.244:5000" > .env.production
npm install
npm run build
cd ..
```

#### 7. Redémarrer l'application
```bash
cd server
pm2 stop arbre-genealogique-api || true
pm2 delete arbre-genealogique-api || true
pm2 start dist/index.js --name arbre-genealogique-api
pm2 save
```

---

## 🔍 Vérifications après déploiement

### Vérifier le statut de l'application
```bash
pm2 status
```

### Voir les logs en temps réel
```bash
pm2 logs arbre-genealogique-api
```

### Tester l'API
```bash
curl http://localhost:5000/api/health
```
Devrait retourner : `{"status":"OK","message":"API is running"}`

### Vérifier MongoDB
```bash
systemctl status mongod
# ou
systemctl status mongodb
```

---

## 🌐 Tester l'application

Ouvrez votre navigateur : **http://57.131.47.244**

**Testez dans cet ordre :**
1. ✅ Page de connexion s'affiche
2. ✅ Se connecter avec vos identifiants
3. ✅ Ajouter une personne → doit apparaître dans la liste immédiatement
4. ✅ Sélectionner une personne
5. ✅ Formulaire de relation s'affiche
6. ✅ Ajouter une relation → doit fonctionner
7. ✅ Voir l'arbre généalogique

---

## 🐛 En cas de problème

### Les personnes ne s'affichent toujours pas ?

```bash
# Vérifier les logs backend
pm2 logs arbre-genealogique-api --lines 50

# Vérifier MongoDB
systemctl status mongod

# Tester l'API manuellement
curl http://localhost:5000/api/personnes
```

### Erreur dans les logs ?

```bash
# Redémarrer MongoDB si nécessaire
systemctl restart mongod

# Redémarrer l'application
pm2 restart arbre-genealogique-api
```

### Ouvrir la console du navigateur (F12)

Regardez s'il y a des erreurs réseau ou CORS.

---

## 📞 Commandes utiles

```bash
# Voir tous les processus PM2
pm2 list

# Voir les logs en temps réel
pm2 logs arbre-genealogique-api

# Redémarrer l'application
pm2 restart arbre-genealogique-api

# Arrêter l'application
pm2 stop arbre-genealogique-api

# Voir les informations détaillées
pm2 show arbre-genealogique-api
```

---

## ✅ Résumé - Une seule commande !

Depuis votre Mac, exécutez :

```bash
ssh root@57.131.47.244 "cd /var/www/arbre-genealogique && git pull origin main && bash deploy-auto.sh"
```

Puis testez sur : **http://57.131.47.244** 🎉
