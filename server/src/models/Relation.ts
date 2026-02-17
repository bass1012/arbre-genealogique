import mongoose, { Document, Schema } from 'mongoose';
import { IPersonne } from './Personne';

export type RelationType = 'parent' | 'conjoint' | 'enfant' | 'frere_soeur';

export interface IRelation extends Document {
  type: RelationType;
  personne1: mongoose.Types.ObjectId | IPersonne;
  personne2: mongoose.Types.ObjectId | IPersonne;
  dateDebut?: Date;
  dateFin?: Date;
  details?: string;
  documents: Array<{
    type: string;
    url: string;
    date: Date;
    description?: string;
  }>;
  familleId: mongoose.Types.ObjectId; // Lien vers la famille
}

const documentSchema = new Schema({
  type: { type: String, required: true },
  url: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: String
});

const relationSchema = new Schema<IRelation>(
  {
    type: {
      type: String,
      required: true,
      enum: ['parent', 'conjoint', 'enfant', 'frere_soeur']
    },
    personne1: {
      type: Schema.Types.ObjectId,
      ref: 'Personne',
      required: true
    },
    personne2: {
      type: Schema.Types.ObjectId,
      ref: 'Personne',
      required: true
    },
    dateDebut: Date,
    dateFin: Date,
    details: String,
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

// Index pour des recherches plus rapides
relationSchema.index({ personne1: 1 });
relationSchema.index({ personne2: 1 });
relationSchema.index({ type: 1 });
relationSchema.index({ personne1: 1, personne2: 1 }, { unique: true });
relationSchema.index({ familleId: 1 }); // Index pour filtrer par famille

const Relation = mongoose.model<IRelation>('Relation', relationSchema);
export default Relation;
