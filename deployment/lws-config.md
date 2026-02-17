# Configuration pour LWS.fr

## Variables d'environnement à configurer dans LWS

Dans votre panel LWS, configurez ces variables d'environnement :

```
PORT=3000
NODE_ENV=production
MONGODB_URI=votre_uri_mongodb_atlas
JWT_SECRET=votre_secret_tres_securise_32_caracteres_minimum
JWT_EXPIRES_IN=30d
CLIENT_URL=https://votredomaine.lws.fr
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Structure des fichiers sur LWS

```
/
├── .htaccess
├── package.json
├── server/
│   └── dist/
├── client/
│   └── build/
└── node_modules/
```

## Étapes de déploiement

1. Zipper le dossier deployment/
2. Uploader via FTP dans www/
3. Exécuter `npm install` via SSH
4. Configurer les variables d'environnement
5. Démarrer avec `npm start`
