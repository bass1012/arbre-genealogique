"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/createAdmin.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Famille_1 = __importDefault(require("../models/Famille"));
dotenv_1.default.config();
const createAdmin = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';
        console.log('📡 Connexion à MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB\n');
        // Données admin
        const adminEmail = 'bassirou2010@gmail.com';
        const adminPassword = 'Keep0ut@2026!';
        const adminNom = 'Admin';
        const adminPrenom = 'Super';
        const familleNom = 'Administration';
        // Vérifier si l'admin existe déjà
        const existingAdmin = await User_1.default.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('⚠️  Un utilisateur avec cet email existe déjà');
            console.log(`Email: ${existingAdmin.email}`);
            console.log(`Rôle: ${existingAdmin.role}`);
            await mongoose_1.default.connection.close();
            return;
        }
        console.log('🏠 Création de la famille Administration...');
        const famille = await Famille_1.default.create({
            nom: familleNom,
            description: 'Famille pour l\'administration du système',
            createdBy: new mongoose_1.default.Types.ObjectId()
        });
        console.log(`✅ Famille créée: ${famille.nom} (ID: ${famille._id})\n`);
        console.log('👤 Création de l\'utilisateur administrateur...');
        const admin = await User_1.default.create({
            email: adminEmail,
            password: adminPassword,
            nom: adminNom,
            prenom: adminPrenom,
            familleId: famille._id,
            role: 'admin'
        });
        // Mettre à jour la famille avec l'ID du créateur
        await Famille_1.default.findByIdAndUpdate(famille._id, { createdBy: admin._id });
        console.log('✅ Administrateur créé avec succès!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 INFORMATIONS DE CONNEXION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${admin.email}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Rôle:     ${admin.role}`);
        console.log(`Famille:  ${famille.nom}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🚀 Vous pouvez maintenant vous connecter à l\'application');
        console.log('   et accéder au dashboard admin pour créer d\'autres utilisateurs.\n');
        await mongoose_1.default.connection.close();
        console.log('✅ Déconnexion de MongoDB');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error.message);
        await mongoose_1.default.connection.close();
        process.exit(1);
    }
};
createAdmin();
