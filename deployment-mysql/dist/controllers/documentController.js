"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocuments = exports.supprimerDocument = exports.ajouterDocument = void 0;
const Personne_1 = __importDefault(require("../models/Personne"));
const uploadService_1 = require("../services/uploadService");
const ajouterDocument = async (req, res) => {
    try {
        const { personneId } = req.params;
        const { type, titre, description, date } = req.body;
        const personne = await Personne_1.default.findOne({
            _id: personneId,
            familleId: req.familleId,
        });
        if (!personne) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        if (!req.file && !req.body.url) {
            res.status(400).json({ message: "Aucun fichier ou URL fourni" });
            return;
        }
        let documentUrl = req.body.url;
        let documentPublicId = undefined;
        let taille = undefined;
        let formatFichier = undefined;
        if (req.file) {
            const uploadResult = await (0, uploadService_1.uploadImage)(req.file.buffer, "arbre-genealogique/documents");
            documentUrl = uploadResult.url;
            documentPublicId = uploadResult.publicId;
            taille = req.file.size;
            formatFichier = req.file.mimetype;
        }
        const nouveauDocument = {
            type,
            titre,
            url: documentUrl,
            urlPublicId: documentPublicId,
            date: date ? new Date(date) : new Date(),
            description,
            taille,
            formatFichier,
        };
        personne.documents.push(nouveauDocument);
        await personne.save();
        res.status(201).json({
            message: "Document ajouté avec succès",
            document: personne.documents[personne.documents.length - 1],
        });
    }
    catch (error) {
        console.error("Erreur lors de l'ajout du document:", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout du document",
            error: error instanceof Error ? error.message : "Erreur inconnue",
        });
    }
};
exports.ajouterDocument = ajouterDocument;
const supprimerDocument = async (req, res) => {
    try {
        const { personneId, documentId } = req.params;
        const personne = await Personne_1.default.findOne({
            _id: personneId,
            familleId: req.familleId,
        });
        if (!personne) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        const documentIndex = personne.documents.findIndex((doc) => doc._id.toString() === documentId);
        if (documentIndex === -1) {
            res.status(404).json({ message: "Document non trouvé" });
            return;
        }
        const document = personne.documents[documentIndex];
        if (document.urlPublicId) {
            try {
                await (0, uploadService_1.deleteImage)(document.urlPublicId);
            }
            catch (error) {
                console.error("Erreur lors de la suppression du document sur Cloudinary:", error);
            }
        }
        personne.documents.splice(documentIndex, 1);
        await personne.save();
        res.status(200).json({ message: "Document supprimé avec succès" });
    }
    catch (error) {
        console.error("Erreur lors de la suppression du document:", error);
        res.status(500).json({
            message: "Erreur lors de la suppression du document",
            error: error instanceof Error ? error.message : "Erreur inconnue",
        });
    }
};
exports.supprimerDocument = supprimerDocument;
const getDocuments = async (req, res) => {
    try {
        const { personneId } = req.params;
        const personne = await Personne_1.default.findOne({
            _id: personneId,
            familleId: req.familleId,
        }).select("documents");
        if (!personne) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        res.status(200).json(personne.documents);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des documents:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des documents",
            error: error instanceof Error ? error.message : "Erreur inconnue",
        });
    }
};
exports.getDocuments = getDocuments;
