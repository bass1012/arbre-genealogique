# Déploiement sur LWS.fr - Instructions

## 📁 Contenu du dossier
- `dist/` : Backend compilé (Node.js)
- `build/` : Frontend compilé (React)
- `.htaccess` : Configuration Apache
- `package.json` : Dépendances et scripts
- `.env.example` : Variables d'environnement

## 🚀 Étapes de déploiement

### 1. Hébergement LWS
1. Connectez-vous à votre panel LWS
2. Allez dans "Hébergement" > "Gestionnaire de fichiers"
3. Uploadez tout ce dossier dans `www/`

### 2. Variables d'environnement
Dans le panel LWS, configurez ces variables :
- PORT=3000
- NODE_ENV=production
- MONGODB_URI=votre_uri_mongodb_atlas
- JWT_SECRET=votre_secret_securise
- CLIENT_URL=https://votredomaine.lws.fr
- CLOUDINARY_CLOUD_NAME=votre_cloud_name
- CLOUDINARY_API_KEY=votre_api_key
- CLOUDINARY_API_SECRET=votre_api_secret

### 3. Installation
1. Connectez-vous en SSH à votre hébergement
2. Exécutez : `cd www && npm install`
3. Démarrez : `npm start`

### 4. Créer l'administrateur
Une fois le site en ligne :
1. Connectez-vous en SSH
2. Exécutez : `node dist/scripts/createAdmin.js`

## 🔧 Vérification
- Visitez votre domaine
- Créez un compte administrateur
- Testez l'upload de photos

## 🆘 Support
En cas de problème :
1. Vérifiez les logs dans le panel LWS
2. Vérifiez les variables d'environnement
3. Assurez-vous que MongoDB Atlas est accessible
