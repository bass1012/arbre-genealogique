"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/create-admin.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const readline_1 = __importDefault(require("readline"));
const User_1 = __importDefault(require("../models/User"));
const Famille_1 = __importDefault(require("../models/Famille"));
dotenv_1.default.config();
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};
const createAdmin = async () => {
    try {
        // Connexion à MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connecté à MongoDB');
        console.log('\n🔧 Création d\'un compte administrateur\n');
        // Demander les informations
        const email = await question('Email de l\'admin: ');
        const password = await question('Mot de passe (min 6 caractères): ');
        const nom = await question('Nom: ');
        const prenom = await question('Prénom: ');
        const nomFamille = await question('Nom de la famille: ');
        const descriptionFamille = await question('Description de la famille (optionnel): ');
        // Validation
        if (!email || !password || !nom || !prenom || !nomFamille) {
            console.error('❌ Tous les champs requis doivent être remplis');
            process.exit(1);
        }
        if (password.length < 6) {
            console.error('❌ Le mot de passe doit contenir au moins 6 caractères');
            process.exit(1);
        }
        // Vérifier si l'email existe déjà
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            console.error('❌ Un utilisateur avec cet email existe déjà');
            process.exit(1);
        }
        // Créer la famille
        console.log('\n📝 Création de la famille...');
        const famille = await Famille_1.default.create({
            nom: nomFamille,
            description: descriptionFamille || '',
            createdBy: new mongoose_1.default.Types.ObjectId() // Temporaire
        });
        console.log('✅ Famille créée:', famille.nom);
        // Créer l'utilisateur admin
        console.log('📝 Création de l\'utilisateur admin...');
        const admin = await User_1.default.create({
            email,
            password,
            nom,
            prenom,
            role: 'admin',
            familleId: famille._id
        });
        // Mettre à jour la famille avec le créateur
        await Famille_1.default.findByIdAndUpdate(famille._id, { createdBy: admin._id });
        console.log('\n✅ Administrateur créé avec succès!\n');
        console.log('📧 Email:', admin.email);
        console.log('👤 Nom:', admin.prenom, admin.nom);
        console.log('🏠 Famille:', famille.nom);
        console.log('🔐 Rôle: admin');
        console.log('\n⚠️  Connectez-vous maintenant à l\'application avec ces identifiants.');
        rl.close();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erreur:', error.message);
        rl.close();
        process.exit(1);
    }
};
createAdmin();
