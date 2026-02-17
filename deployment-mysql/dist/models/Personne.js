"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const professionSchema = new mongoose_1.Schema({
    intitule: { type: String, required: true },
    dateDebut: Date,
    dateFin: Date,
    lieu: String
}, { _id: false });
const etablissementEtudesSchema = new mongoose_1.Schema({
    nom: { type: String, required: true },
    diplome: String,
    dateDebut: Date,
    dateFin: Date
}, { _id: false });
const adresseSchema = new mongoose_1.Schema({
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
const reseauSocialSchema = new mongoose_1.Schema({
    plateforme: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });
const contactsSchema = new mongoose_1.Schema({
    email: String,
    telephone: String,
    reseauxSociaux: [reseauSocialSchema]
}, { _id: false });
const documentSchema = new mongoose_1.Schema({
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
const personneSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Famille',
        required: true
    }
}, {
    timestamps: true
});
// Index pour les recherches
personneSchema.index({ nom: 'text', prenom: 'text', nomJeuneFille: 'text', biographie: 'text' });
personneSchema.index({ dateNaissance: 1 });
personneSchema.index({ dateDeces: 1 });
personneSchema.index({ genre: 1 });
personneSchema.index({ familleId: 1 }); // Index pour filtrer par famille
const Personne = mongoose_1.default.model('Personne', personneSchema);
exports.default = Personne;
