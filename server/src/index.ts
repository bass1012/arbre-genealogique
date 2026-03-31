import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import personneRoutes from './routes/personneRoutes';
import relationRoutes from './routes/relationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import documentRoutes from './routes/documentRoutes';
import adminRoutes from './routes/adminRoutes';
import { requestLogger } from './middleware/logger';

// Chargement des variables d'environnement
dotenv.config();

// Création de l'application Express
const app: Application = express();

// Configuration CORS flexible
const corsOptions = {
  origin: process.env.CLIENT_URL === '*' 
    ? '*' 
    : (process.env.CLIENT_URL || 'http://localhost:3000'),
  credentials: process.env.CLIENT_URL !== '*'
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// Routes de l'API
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);

// Routes des personnes et relations (protégées)
app.use('/api/personnes', personneRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);

// Routes admin (protégées - admin seulement)
app.use('/api/admin', adminRoutes);

// Gestion des erreurs 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connexion à MongoDB et démarrage du serveur
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connecté à MongoDB');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erreur de connexion à MongoDB :', error);
    process.exit(1);
  });

export default app;