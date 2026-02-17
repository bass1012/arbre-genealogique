import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Personne from '../models/Personne';
import Relation from '../models/Relation';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';

async function resetDatabase() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('🗑️  Suppression de toutes les personnes...');
    const deletedPersonnes = await Personne.deleteMany({});
    console.log(`✅ ${deletedPersonnes.deletedCount} personnes supprimées`);

    console.log('🗑️  Suppression de toutes les relations...');
    const deletedRelations = await Relation.deleteMany({});
    console.log(`✅ ${deletedRelations.deletedCount} relations supprimées`);

    console.log('✨ Base de données réinitialisée avec succès!');

    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  }
}

resetDatabase();
