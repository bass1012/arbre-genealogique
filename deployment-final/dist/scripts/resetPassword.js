"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/resetPassword.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const resetPassword = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';
        console.log('📡 Connexion à MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB\n');
        const email = 'bassirou2010@gmail.com';
        const newPassword = 'Keep0ut@2026!';
        // Trouver l'utilisateur
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            await mongoose_1.default.connection.close();
            process.exit(1);
        }
        console.log(`👤 Utilisateur trouvé: ${user.email}`);
        console.log(`   Rôle: ${user.role}\n`);
        // Mettre à jour le mot de passe
        user.password = newPassword;
        await user.save();
        console.log('✅ Mot de passe réinitialisé avec succès!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 NOUVEAUX IDENTIFIANTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        await mongoose_1.default.connection.close();
        console.log('✅ Déconnexion de MongoDB');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erreur:', error.message);
        await mongoose_1.default.connection.close();
        process.exit(1);
    }
};
resetPassword();
