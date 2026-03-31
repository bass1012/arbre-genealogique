# 🚀 Guide de Redéploiement - Arbre Généalogique

## 📝 Problèmes corrigés

### 1. **Problème de récupération des données**
- ❌ **Ancien code** : `setPersonnes(response.data || [])`
- ✅ **Nouveau code** : `setPersonnes(response || [])`
- **Cause** : Le serveur renvoie directement les données, pas un objet avec une propriété `data`

### 2. **Configuration CORS améliorée**
- Ajout du support pour `CLIENT_URL=*` pour autoriser toutes les origines
- Configuration flexible selon l'environnement

## 📦 Fichiers modifiés

1. ✅ `client/src/App.tsx` - Correction des appels API
2. ✅ `client/src/components/Admin/AdminDashboard.tsx` - Correction des appels API
3. ✅ `server/src/index.ts` - Amélioration de la configuration CORS
4. ✅ `server/.env.production` - Fichier de configuration créé

---

## 🔧 Étapes de redéploiement sur votre VPS

### Étape 1 : Mettre à jour le code source

```bash
# Connexion au VPS
ssh root@57.131.47.244

# Aller dans le répertoire du projet
cd /var/www/arbre-genealogique

# Sauvegarder les modifications locales si nécessaires
git stash

# Récupérer les dernières modifications
git pull origin main

# Restaurer les modifications locales si nécessaire
git stash pop
```

### Étape 2 : Configurer les variables d'environnement du serveur

Créer ou mettre à jour le fichier `/var/www/arbre-genealogique/server/.env` :

```bash
cat > /var/www/arbre-genealogique/server/.env << 'EOF'
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/arbre-genealogique

# JWT - CHANGEZ CE SECRET!
JWT_SECRET=changez_ce_secret_en_production_12345678901234567890
JWT_EXPIRES_IN=30d

# CORS - Utilisez * pour autoriser toutes les origines ou spécifiez votre domaine
CLIENT_URL=*

# Cloudinary
CLOUDINARY_CLOUD_NAME=dugtvvrp2
CLOUDINARY_API_KEY=113667211352998
CLOUDINARY_API_SECRET=aTcSqtP6_Jhh3n5LvmPUSDVqeds
EOF
```

### Étape 3 : Reconstruire le backend

```bash
cd /var/www/arbre-genealogique/server
npm install
npm run build
```

### Étape 4 : Vérifier que le fichier .env.production existe pour le client

```bash
cat > /var/www/arbre-genealogique/client/.env.production << 'EOF'
REACT_APP_API_URL=http://57.131.47.244:5000
EOF
```

### Étape 5 : Reconstruire le frontend

```bash
cd /var/www/arbre-genealogique/client
npm install
npm run build
```

### Étape 6 : Redémarrer le serveur backend avec PM2

```bash
cd /var/www/arbre-genealogique/server

# Arrêter l'application si elle tourne
pm2 stop arbre-genealogique-api || true

# Démarrer l'application
pm2 start dist/index.js --name arbre-genealogique-api

# Sauvegarder la configuration PM2
pm2 save
```

### Étape 7 : Vérifier les logs

```bash
# Voir les logs en temps réel
pm2 logs arbre-genealogique-api

# Vérifier le statut
pm2 status
```

### Étape 8 : Tester l'application

Ouvrez votre navigateur et allez sur : `http://57.131.47.244`

**Testez :**
1. ✅ Connexion
2. ✅ Ajout d'une personne
3. ✅ Affichage de la liste des personnes
4. ✅ Ajout d'une relation
5. ✅ Affichage de l'arbre généalogique

---

## 🐛 Dépannage

### Les personnes n'apparaissent toujours pas ?

1. **Vérifier les logs du backend :**
   ```bash
   pm2 logs arbre-genealogique-api
   ```

2. **Vérifier que MongoDB fonctionne :**
   ```bash
   systemctl status mongodb
   # ou
   systemctl status mongod
   ```

3. **Vérifier la connexion à l'API :**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Devrait retourner : `{"status":"OK","message":"API is running"}`

4. **Vérifier le navigateur (Console F12) :**
   - Regardez s'il y a des erreurs CORS
   - Vérifiez que les requêtes API sont envoyées vers `http://57.131.47.244:5000`

### Erreur CORS ?

Si vous voyez des erreurs CORS dans la console du navigateur, vérifiez que :
- Le serveur est bien redémarré avec la nouvelle configuration
- Le `.env` contient `CLIENT_URL=*`

### Les relations ne s'affichent pas ?

Vérifiez dans les logs du navigateur (F12) s'il y a des erreurs lors du chargement des relations.

---

## 📝 Configuration Nginx (optionnel mais recommandé)

Si vous voulez servir l'application via Nginx sur le port 80 :

```nginx
server {
    listen 80;
    server_name 57.131.47.244;

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activez la configuration :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Checklist de déploiement

- [ ] Code source mis à jour
- [ ] Variables d'environnement configurées
- [ ] Backend reconstruit
- [ ] Frontend reconstruit
- [ ] PM2 redémarré
- [ ] MongoDB en cours d'exécution
- [ ] Test de connexion
- [ ] Test d'ajout de personne
- [ ] Test d'ajout de relation
- [ ] Test de l'arbre généalogique

---

## 📞 Support

Si vous rencontrez toujours des problèmes après avoir suivi ce guide, vérifiez :
- Les logs PM2 : `pm2 logs`
- Les logs MongoDB : `sudo journalctl -u mongod -f`
- Les logs Nginx (si utilisé) : `sudo tail -f /var/log/nginx/error.log`
