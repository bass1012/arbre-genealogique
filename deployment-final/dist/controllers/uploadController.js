"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePhoto = exports.uploadPhotoBase64 = exports.uploadPhoto = void 0;
const uploadService_1 = require("../services/uploadService");
const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Aucun fichier fourni' });
            return;
        }
        const result = await (0, uploadService_1.uploadImage)(req.file.buffer, 'arbre-genealogique/photos');
        res.status(200).json({
            message: 'Photo uploadée avec succès',
            url: result.url,
            publicId: result.publicId
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'upload de la photo:', error);
        res.status(500).json({
            message: 'Erreur lors de l\'upload de la photo',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.uploadPhoto = uploadPhoto;
const uploadPhotoBase64 = async (req, res) => {
    try {
        const { base64Image } = req.body;
        if (!base64Image) {
            res.status(400).json({ message: 'Image base64 requise' });
            return;
        }
        const result = await (0, uploadService_1.uploadBase64Image)(base64Image, 'arbre-genealogique/photos');
        res.status(200).json({
            message: 'Photo uploadée avec succès',
            url: result.url,
            publicId: result.publicId
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'upload de la photo base64:', error);
        res.status(500).json({
            message: 'Erreur lors de l\'upload de la photo',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.uploadPhotoBase64 = uploadPhotoBase64;
const removePhoto = async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            res.status(400).json({ message: 'Public ID requis' });
            return;
        }
        await (0, uploadService_1.deleteImage)(publicId);
        res.status(200).json({
            message: 'Photo supprimée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de la photo:', error);
        res.status(500).json({
            message: 'Erreur lors de la suppression de la photo',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.removePhoto = removePhoto;
