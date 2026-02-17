# Checklist de déploiement en production

## 1. Configuration requise

### Base de données
- [ ] Créer un compte MongoDB Atlas
- [ ] Créer une base de données
- [ ] Configurer l'accès IP (0.0.0.0/0 pour LWS)
- [ ] Copier l'URI de connexion

### Cloudinary
- [ ] Vérifier le compte Cloudinary
- [ ] Récupérer : cloud_name, api_key, api_secret

### Hébergement LWS
- [ ] Choisir une offre avec Node.js
- [ ] Acheter un domaine
- [ ] Accéder au panel d'administration

## 2. Modifications du code

### Backend
- [ ] Mettre à jour MONGODB_URI avec MongoDB Atlas
- [ ] Mettre à jour CLIENT_URL avec votre domaine
- [ ] Générer un JWT_SECRET sécurisé
- [ ] Changer PORT si nécessaire (3000 pour LWS)

### Frontend
- [ ] Créer .env.production dans client/
```
REACT_APP_API_URL=https://votredomaine.lws.fr
```

## 3. Build et déploiement

### Préparation
```bash
# Build backend
cd server
npm run build

# Build frontend
cd ../client
npm run build
```

### Déploiement LWS Mutualisé
1. [ ] Zipper le dossier deployment/
2. [ ] Uploader via FTP dans www/
3. [ ] Configurer les variables d'environnement LWS
4. [ ] Exécuter `npm install` via SSH
5. [ ] Redémarrer l'application

### Déploiement VPS
1. [ ] Connecter en SSH au VPS
2. [ ] Cloner le dépôt
3. [ ] Exécuter `chmod +x deploy-vps.sh`
4. [ ] Lancer `./deploy-vps.sh`

## 4. Post-déploiement

- [ ] Tester l'accès au site
- [ ] Tester la création de compte admin
- [ ] Tester l'upload de photos
- [ ] Vérifier les logs d'erreurs
- [ ] Configurer HTTPS (certificat SSL gratuit LWS)

## 5. Maintenance

- [ ] Mettre en place des backups automatiques
- [ ] Surveiller les logs
- [ ] Mettre à jour régulièrement les dépendances
