// src/scripts/create-admin.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../models/User';
import Famille from '../models/Famille';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdmin = async () => {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';
    await mongoose.connect(mongoUri);
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('❌ Un utilisateur avec cet email existe déjà');
      process.exit(1);
    }

    // Créer la famille
    console.log('\n📝 Création de la famille...');
    const famille = await Famille.create({
      nom: nomFamille,
      description: descriptionFamille || '',
      createdBy: new mongoose.Types.ObjectId() // Temporaire
    });
    console.log('✅ Famille créée:', famille.nom);

    // Créer l'utilisateur superadmin
    console.log('📝 Création de l\'utilisateur superadmin...');
    const admin = await User.create({
      email,
      password,
      nom,
      prenom,
      role: 'superadmin',
      familleId: famille._id
    });

    // Mettre à jour la famille avec le créateur
    await Famille.findByIdAndUpdate(famille._id, { createdBy: admin._id });

    console.log('\n✅ Super administrateur créé avec succès!\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Nom:', admin.prenom, admin.nom);
    console.log('🏠 Famille:', famille.nom);
    console.log('🔐 Rôle: superadmin');
    console.log('\n⚠️  Connectez-vous maintenant à l\'application avec ces identifiants.');

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    rl.close();
    process.exit(1);
  }
};

createAdmin();
