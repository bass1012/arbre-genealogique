"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const personneRoutes_1 = __importDefault(require("./routes/personneRoutes"));
const relationRoutes_1 = __importDefault(require("./routes/relationRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const logger_1 = require("./middleware/logger");
// Chargement des variables d'environnement
dotenv_1.default.config();
// Création de l'application Express
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(logger_1.requestLogger);
// Routes de l'API
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});
// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes_1.default);
// Routes des personnes et relations (protégées)
app.use('/api/personnes', personneRoutes_1.default);
app.use('/api/relations', relationRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/documents', documentRoutes_1.default);
// Routes admin (protégées - admin seulement)
app.use('/api/admin', adminRoutes_1.default);
// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});
// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
// Connexion à MongoDB et démarrage du serveur
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';
mongoose_1.default
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
exports.default = app;
