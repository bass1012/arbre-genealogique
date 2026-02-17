"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Personne_1 = __importDefault(require("../models/Personne"));
const Relation_1 = __importDefault(require("../models/Relation"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';
async function resetDatabase() {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');
        console.log('🗑️  Suppression de toutes les personnes...');
        const deletedPersonnes = await Personne_1.default.deleteMany({});
        console.log(`✅ ${deletedPersonnes.deletedCount} personnes supprimées`);
        console.log('🗑️  Suppression de toutes les relations...');
        const deletedRelations = await Relation_1.default.deleteMany({});
        console.log(`✅ ${deletedRelations.deletedCount} relations supprimées`);
        console.log('✨ Base de données réinitialisée avec succès!');
        await mongoose_1.default.connection.close();
        console.log('🔌 Connexion fermée');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error);
        process.exit(1);
    }
}
resetDatabase();
