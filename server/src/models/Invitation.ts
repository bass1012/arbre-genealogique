// src/models/Invitation.ts
import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IInvitation extends Document {
  code: string;
  familleId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  email?: string; // Email spécifique (optionnel)
  role: 'membre' | 'lecteur';
  expiresAt: Date;
  usedBy?: mongoose.Types.ObjectId;
  usedAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

const InvitationSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex')
    },
    familleId: {
      type: Schema.Types.ObjectId,
      ref: 'Famille',
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['membre', 'lecteur'],
      default: 'membre'
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index pour recherche rapide par code
InvitationSchema.index({ code: 1 });
InvitationSchema.index({ familleId: 1, isActive: 1 });

export default mongoose.model<IInvitation>('Invitation', InvitationSchema);
