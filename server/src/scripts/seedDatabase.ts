import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Personne from '../models/Personne';
import Relation from '../models/Relation';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arbre-genealogique';

async function seedDatabase() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Réinitialiser la base de données
    console.log('🗑️  Nettoyage de la base de données...');
    await Personne.deleteMany({});
    await Relation.deleteMany({});
    console.log('✅ Base nettoyée');

    // Créer des personnes d'exemple
    console.log('👥 Création des personnes...');
    
    const grandPere = await Personne.create({
      nom: 'Dupont',
      prenom: 'Jean',
      dateNaissance: new Date('1940-05-15'),
      genre: 'homme',
      lieuNaissance: 'Paris',
      profession: 'Enseignant'
    });

    const grandMere = await Personne.create({
      nom: 'Martin',
      prenom: 'Marie',
      dateNaissance: new Date('1942-08-20'),
      genre: 'femme',
      lieuNaissance: 'Lyon'
    });

    const pere = await Personne.create({
      nom: 'Dupont',
      prenom: 'Pierre',
      dateNaissance: new Date('1965-03-10'),
      genre: 'homme',
      lieuNaissance: 'Paris',
      profession: 'Ingénieur'
    });

    const mere = await Personne.create({
      nom: 'Bernard',
      prenom: 'Sophie',
      dateNaissance: new Date('1967-11-25'),
      genre: 'femme',
      lieuNaissance: 'Marseille',
      profession: 'Médecin'
    });

    const enfant1 = await Personne.create({
      nom: 'Dupont',
      prenom: 'Lucas',
      dateNaissance: new Date('1995-07-12'),
      genre: 'homme',
      lieuNaissance: 'Paris'
    });

    const enfant2 = await Personne.create({
      nom: 'Dupont',
      prenom: 'Emma',
      dateNaissance: new Date('1998-04-08'),
      genre: 'femme',
      lieuNaissance: 'Paris'
    });

    console.log('✅ 6 personnes créées');

    // Créer des relations
    console.log('🔗 Création des relations...');

    // Mariage grands-parents
    await Relation.create({
      type: 'mariage',
      personne1: grandPere._id,
      personne2: grandMere._id,
      dateDebut: new Date('1963-06-15'),
      details: 'Mariage à Paris'
    });

    // Grand-père -> Père (relation parent)
    await Relation.create({
      type: 'parent',
      personne1: grandPere._id,
      personne2: pere._id
    });

    // Grand-mère -> Père (relation parent)
    await Relation.create({
      type: 'parent',
      personne1: grandMere._id,
      personne2: pere._id
    });

    // Père -> Grand-père (relation enfant - inverse)
    await Relation.create({
      type: 'enfant',
      personne1: pere._id,
      personne2: grandPere._id
    });

    // Père -> Grand-mère (relation enfant - inverse)
    await Relation.create({
      type: 'enfant',
      personne1: pere._id,
      personne2: grandMere._id
    });

    // Mariage parents
    await Relation.create({
      type: 'mariage',
      personne1: pere._id,
      personne2: mere._id,
      dateDebut: new Date('1992-09-20'),
      details: 'Mariage à Lyon'
    });

    // Père -> Enfant 1
    await Relation.create({
      type: 'parent',
      personne1: pere._id,
      personne2: enfant1._id
    });

    // Mère -> Enfant 1
    await Relation.create({
      type: 'parent',
      personne1: mere._id,
      personne2: enfant1._id
    });

    // Enfant 1 -> Père (inverse)
    await Relation.create({
      type: 'enfant',
      personne1: enfant1._id,
      personne2: pere._id
    });

    // Enfant 1 -> Mère (inverse)
    await Relation.create({
      type: 'enfant',
      personne1: enfant1._id,
      personne2: mere._id
    });

    // Père -> Enfant 2
    await Relation.create({
      type: 'parent',
      personne1: pere._id,
      personne2: enfant2._id
    });

    // Mère -> Enfant 2
    await Relation.create({
      type: 'parent',
      personne1: mere._id,
      personne2: enfant2._id
    });

    // Enfant 2 -> Père (inverse)
    await Relation.create({
      type: 'enfant',
      personne1: enfant2._id,
      personne2: pere._id
    });

    // Enfant 2 -> Mère (inverse)
    await Relation.create({
      type: 'enfant',
      personne1: enfant2._id,
      personne2: mere._id
    });

    // Relation frère-sœur
    await Relation.create({
      type: 'frere_soeur',
      personne1: enfant1._id,
      personne2: enfant2._id
    });

    await Relation.create({
      type: 'frere_soeur',
      personne1: enfant2._id,
      personne2: enfant1._id
    });

    console.log('✅ Relations créées');

    console.log('✨ Base de données initialisée avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - Personnes: ${await Personne.countDocuments()}`);
    console.log(`   - Relations: ${await Relation.countDocuments()}`);

    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

seedDatabase();
