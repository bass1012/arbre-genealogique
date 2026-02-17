"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArbreGenealogique = exports.searchPersonnes = exports.deletePersonne = exports.updatePersonne = exports.createPersonne = exports.getPersonne = exports.getPersonnes = void 0;
const express_validator_1 = require("express-validator");
const Personne_1 = __importDefault(require("../models/Personne"));
const Relation_1 = __importDefault(require("../models/Relation"));
const uploadService_1 = require("../services/uploadService");
const getPersonnes = async (req, res) => {
    try {
        console.log("Requête reçue pour récupérer les personnes");
        // Filtrer par famille de l'utilisateur connecté
        const personnes = await Personne_1.default.find({ familleId: req.familleId }).sort({
            nom: 1,
            prenom: 1,
        });
        console.log("Personnes récupérées avec succès:", personnes);
        res.status(200).json(personnes);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des personnes:", error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des personnes", error });
    }
};
exports.getPersonnes = getPersonnes;
const getPersonne = async (req, res) => {
    try {
        console.log("Requête reçue pour récupérer une personne:", req.params.id);
        // Vérifier que la personne appartient à la famille de l'utilisateur
        const personne = await Personne_1.default.findOne({
            _id: req.params.id,
            familleId: req.familleId,
        });
        if (!personne) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        res.status(200).json(personne);
    }
    catch (error) {
        res
            .status(500)
            .json({
            message: "Erreur lors de la récupération de la personne",
            error,
        });
    }
};
exports.getPersonne = getPersonne;
const createPersonne = async (req, res) => {
    console.log("=== DEBUT createPersonne ===");
    console.log("Corps de la requête:", JSON.stringify(req.body, null, 2));
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log("Erreurs de validation:", errors.array());
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        console.log("Création d'une nouvelle personne avec les données:", req.body);
        let photoUrl = req.body.photo;
        let photoPublicId = undefined;
        if (req.body.photo && req.body.photo.startsWith("data:image")) {
            try {
                const uploadResult = await (0, uploadService_1.uploadBase64Image)(req.body.photo);
                photoUrl = uploadResult.url;
                photoPublicId = uploadResult.publicId;
                console.log("Photo uploadée sur Cloudinary:", photoUrl);
            }
            catch (uploadError) {
                console.error("Erreur lors de l'upload de la photo:", uploadError);
            }
        }
        const personneData = {
            ...req.body,
            photo: photoUrl,
            photoPublicId,
            familleId: req.familleId, // Ajouter l'ID de la famille
        };
        const nouvellePersonne = new Personne_1.default(personneData);
        console.log("Nouvelle personne créée (avant sauvegarde):", nouvellePersonne);
        const personneSauvegardee = await nouvellePersonne.save();
        console.log("Personne sauvegardée avec succès:", personneSauvegardee);
        res.status(201).json(personneSauvegardee);
    }
    catch (error) {
        console.error("ERREUR lors de la création de la personne:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue";
        const errorStack = error instanceof Error && process.env.NODE_ENV === "development"
            ? error.stack
            : undefined;
        res.status(500).json({
            message: "Erreur lors de la création de la personne",
            error: errorMessage,
            stack: errorStack,
        });
    }
    finally {
        console.log("=== FIN createPersonne ===");
    }
};
exports.createPersonne = createPersonne;
const updatePersonne = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        // Vérifier que la personne appartient à la famille de l'utilisateur
        const personneExistante = await Personne_1.default.findOne({
            _id: req.params.id,
            familleId: req.familleId,
        });
        if (!personneExistante) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        let photoUrl = req.body.photo;
        let photoPublicId = personneExistante.photoPublicId;
        if (req.body.photo && req.body.photo.startsWith("data:image")) {
            try {
                if (personneExistante.photoPublicId) {
                    await (0, uploadService_1.deleteImage)(personneExistante.photoPublicId);
                }
                const uploadResult = await (0, uploadService_1.uploadBase64Image)(req.body.photo);
                photoUrl = uploadResult.url;
                photoPublicId = uploadResult.publicId;
            }
            catch (uploadError) {
                console.error("Erreur lors de l'upload de la nouvelle photo:", uploadError);
            }
        }
        const updateData = {
            ...req.body,
            photo: photoUrl,
            photoPublicId,
        };
        const personne = await Personne_1.default.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
        if (!personne) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        res.status(200).json(personne);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la mise à jour de la personne", error });
    }
};
exports.updatePersonne = updatePersonne;
const deletePersonne = async (req, res) => {
    try {
        // Vérifier d'abord que la personne appartient à la famille
        const personne = await Personne_1.default.findOne({
            _id: req.params.id,
            familleId: req.familleId,
        });
        if (!personne) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        const relations = await Relation_1.default.find({
            $or: [{ personne1: req.params.id }, { personne2: req.params.id }],
            familleId: req.familleId,
        });
        if (relations.length > 0) {
            res.status(400).json({
                message: "Impossible de supprimer cette personne car elle a des relations existantes",
                relations: relations.map((r) => r._id),
            });
            return;
        }
        if (personne.photoPublicId) {
            try {
                await (0, uploadService_1.deleteImage)(personne.photoPublicId);
            }
            catch (error) {
                console.error("Erreur lors de la suppression de la photo sur Cloudinary:", error);
            }
        }
        await Personne_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Personne supprimée avec succès" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la suppression de la personne", error });
    }
};
exports.deletePersonne = deletePersonne;
const searchPersonnes = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            res.status(400).json({ message: "Le paramètre de recherche est requis" });
            return;
        }
        const searchTerm = q.toString();
        const personnes = await Personne_1.default.find({ familleId: req.familleId, $text: { $search: searchTerm } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
        res.status(200).json(personnes);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la recherche des personnes", error });
    }
};
exports.searchPersonnes = searchPersonnes;
const getArbreGenealogique = async (req, res) => {
    var _a;
    try {
        const personneId = req.params.id;
        const generations = parseInt(((_a = req.query.generations) === null || _a === void 0 ? void 0 : _a.toString()) || "3");
        // Récupérer la personne principale
        const personne = await Personne_1.default.findOne({
            _id: personneId,
            familleId: req.familleId,
        });
        if (!personne) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        // Fonction récursive pour construire l'arbre généalogique
        const construireArbre = async (id, niveau) => {
            if (niveau > generations)
                return null;
            const personne = await Personne_1.default.findOne({
                _id: id,
                familleId: req.familleId,
            });
            if (!personne)
                return null;
            // Récupérer les relations parentales
            const relations = await Relation_1.default.find({
                familleId: req.familleId,
                $or: [
                    { personne1: id, type: "parent" },
                    { personne2: id, type: "enfant" },
                ],
            })
                .populate("personne1")
                .populate("personne2");
            // Construire l'objet pour cette personne
            const noeud = {
                ...personne.toObject(),
                parents: [],
                enfants: [],
            };
            // Récupérer les parents et les enfants
            for (const relation of relations) {
                if (relation.type === "parent") {
                    const parentId = relation.personne1.toString() === id
                        ? relation.personne2.toString()
                        : relation.personne1.toString();
                    const parent = await construireArbre(parentId, niveau + 1);
                    if (parent) {
                        noeud.parents.push(parent);
                    }
                }
                else if (relation.type === "enfant") {
                    const enfantId = relation.personne1.toString() === id
                        ? relation.personne2.toString()
                        : relation.personne1.toString();
                    const enfant = await construireArbre(enfantId, niveau + 1);
                    if (enfant) {
                        noeud.enfants.push(enfant);
                    }
                }
            }
            return noeud;
        };
        const arbre = await construireArbre(personneId, 1);
        res.status(200).json(arbre);
    }
    catch (error) {
        console.error("Erreur lors de la construction de l'arbre généalogique:", error);
        res
            .status(500)
            .json({
            message: "Erreur lors de la construction de l'arbre généalogique",
            error,
        });
    }
};
exports.getArbreGenealogique = getArbreGenealogique;
