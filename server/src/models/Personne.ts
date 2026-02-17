import mongoose, { Document, Schema } from 'mongoose';

export interface IPersonne extends Document {
  nom: string;
  prenom: string;
  nomJeuneFille?: string;
  surnoms?: string[];
  dateNaissance?: Date;
  lieuNaissance?: string;
  dateDeces?: Date;
  lieuDeces?: string;
  causeDeces?: string;
  profession?: string;
  professions?: Array<{
    intitule: string;
    dateDebut?: Date;
    dateFin?: Date;
    lieu?: string;
  }>;
  genre?: 'homme' | 'femme' | 'autre';
  photo?: string;
  photoPublicId?: string;
  biographie?: string;
  notes?: string;
  nationalite?: string;
  religion?: string;
  niveauEtudes?: string;
  etablissementsEtudes?: Array<{
    nom: string;
    diplome?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }>;
  adresses?: Array<{
    adresse: string;
    ville: string;
    pays: string;
    codePostal?: string;
    dateDebut?: Date;
    dateFin?: Date;
    type?: 'residence' | 'travail' | 'naissance' | 'deces';
  }>;
  contacts?: {
    email?: string;
    telephone?: string;
    reseauxSociaux?: Array<{
      plateforme: string;
      url: string;
    }>;
  };
  documents: Array<{
    type: string;
    titre: string;
    url: string;
    urlPublicId?: string;
    date: Date;
    description?: string;
    taille?: number;
    formatFichier?: string;
  }>;
  familleId: mongoose.Types.ObjectId; // Lien vers la famille
  createdAt: Date;
  updatedAt: Date;
}

const professionSchema = new Schema({
  intitule: { type: String, required: true },
  dateDebut: Date,
  dateFin: Date,
  lieu: String
}, { _id: false });

const etablissementEtudesSchema = new Schema({
  nom: { type: String, required: true },
  diplome: String,
  dateDebut: Date,
  dateFin: Date
}, { _id: false });

const adresseSchema = new Schema({
  adresse: { type: String, required: true },
  ville: { type: String, required: true },
  pays: { type: String, required: true },
  codePostal: String,
  dateDebut: Date,
  dateFin: Date,
  type: { 
    type: String, 
    enum: ['residence', 'travail', 'naissance', 'deces'],
    default: 'residence'
  }
}, { _id: false });

const reseauSocialSchema = new Schema({
  plateforme: { type: String, required: true },
  url: { type: String, required: true }
}, { _id: false });

const contactsSchema = new Schema({
  email: String,
  telephone: String,
  reseauxSociaux: [reseauSocialSchema]
}, { _id: false });

const documentSchema = new Schema({
  type: { 
    type: String, 
    required: true,
    enum: [
      'acte_naissance',
      'acte_deces',
      'acte_mariage',
      'photo',
      'diplome',
      'contrat_travail',
      'document_identite',
      'certificat',
      'autre'
    ]
  },
  titre: { type: String, required: true },
  url: { type: String, required: true },
  urlPublicId: String,
  date: { type: Date, default: Date.now },
  description: String,
  taille: Number,
  formatFichier: String
}, { _id: true });

const personneSchema = new Schema<IPersonne>(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    nomJeuneFille: { type: String, trim: true },
    surnoms: [{ type: String, trim: true }],
    dateNaissance: Date,
    lieuNaissance: String,
    dateDeces: Date,
    lieuDeces: String,
    causeDeces: String,
    profession: String,
    professions: [professionSchema],
    genre: { type: String, enum: ['homme', 'femme', 'autre'] },
    photo: String,
    photoPublicId: String,
    biographie: String,
    notes: String,
    nationalite: String,
    religion: String,
    niveauEtudes: String,
    etablissementsEtudes: [etablissementEtudesSchema],
    adresses: [adresseSchema],
    contacts: contactsSchema,
    documents: [documentSchema],
    familleId: {
      type: Schema.Types.ObjectId,
      ref: 'Famille',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index pour les recherches
personneSchema.index({ nom: 'text', prenom: 'text', nomJeuneFille: 'text', biographie: 'text' });
personneSchema.index({ dateNaissance: 1 });
personneSchema.index({ dateDeces: 1 });
personneSchema.index({ genre: 1 });
personneSchema.index({ familleId: 1 }); // Index pour filtrer par famille

const Personne = mongoose.model<IPersonne>('Personne', personneSchema);
export default Personne;
