# Déploiement MySQL sur LWS.fr

## 🎯 Avantages avec MySQL LWS
- ✅ Base de données incluse dans l'hébergement
- ✅ Pas de configuration externe
- ✅ Performances optimisées (même serveur)
- ✅ Gestion via phpMyAdmin LWS
- ✅ Backups automatiques LWS

## 📋 Étapes de déploiement

### 1. Créer la base de données MySQL
1. Connectez-vous à votre panel LWS
2. Allez dans "Bases de données" > "phpMyAdmin"
3. Créez une nouvelle base : `arbre_genealogique`
4. Importez le fichier `schema.sql`

### 2. Variables d'environnement LWS
Configurez ces variables dans votre panel LWS :
```
NODE_ENV=production
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=votre_utilisateur_mysql
MYSQL_PASSWORD=votre_mot_de_passe_mysql
MYSQL_DATABASE=arbre_genealogique
JWT_SECRET=votre_secret_32_caracteres_minimum
JWT_EXPIRES_IN=30d
CLIENT_URL=https://votredomaine.lws.fr
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 3. Déploiement des fichiers
1. Zippez le dossier `deployment-mysql/`
2. Uploadez via FTP dans `www/`
3. Exécutez en SSH : `npm install`
4. Démarrez : `npm start`

### 4. Créer l'administrateur
Une fois le site en ligne :
1. Connectez-vous en SSH
2. Exécutez : `node dist/scripts/createAdmin.js`

## 🔧 Configuration requise

### Dans phpMyAdmin LWS
- Importer `database/schema.sql`
- Vérifier que toutes les tables sont créées
- Noter vos identifiants MySQL

### Variables importantes
- `MYSQL_USER` : Votre identifiant LWS MySQL
- `MYSQL_PASSWORD` : Votre mot de passe LWS MySQL
- `MYSQL_HOST` : Généralement `localhost`
- `MYSQL_DATABASE` : `arbre_genealogique`

## 🚀 Test après déploiement

1. Visitez votre domaine
2. Créez un compte administrateur
3. Testez l'ajout de personnes
4. Testez l'upload de photos

## 🆘 Support LWS

En cas de problème :
1. Vérifiez les logs dans le panel LWS
2. Testez la connexion MySQL via phpMyAdmin
3. Vérifiez les variables d'environnement
4. Contactez le support LWS si nécessaire
