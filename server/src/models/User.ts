// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  familleId: mongoose.Types.ObjectId;
  role: 'superadmin' | 'gestionnaire' | 'membre' | 'lecteur';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false // Ne pas retourner le password par défaut
    },
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true
    },
    familleId: {
      type: Schema.Types.ObjectId,
      ref: 'Famille',
      required: [true, 'La famille est requise']
    },
    role: {
      type: String,
      enum: ['superadmin', 'gestionnaire', 'membre', 'lecteur'],
      default: 'membre',
      description: 'superadmin: admin global | gestionnaire: admin famille | membre: lecture+écriture | lecteur: lecture seule'
    }
  },
  {
    timestamps: true
  }
);

// Hash le mot de passe avant sauvegarde
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
