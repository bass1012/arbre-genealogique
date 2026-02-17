// src/models/Famille.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFamille extends Document {
  nom: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FamilleSchema: Schema = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la famille est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IFamille>('Famille', FamilleSchema);
