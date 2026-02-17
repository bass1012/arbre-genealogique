"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFamille = exports.deleteRelation = exports.updateRelation = exports.createRelation = exports.getRelationsByPersonne = exports.getRelations = void 0;
const express_validator_1 = require("express-validator");
const Relation_1 = __importDefault(require("../models/Relation"));
const Personne_1 = __importDefault(require("../models/Personne"));
const getRelations = async (req, res) => {
    try {
        // Filtrer par famille
        const relations = await Relation_1.default.find({ familleId: req.familleId })
            .populate("personne1", "nom prenom")
            .populate("personne2", "nom prenom");
        res.status(200).json(relations);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des relations", error });
    }
};
exports.getRelations = getRelations;
const getRelationsByPersonne = async (req, res) => {
    try {
        const personneId = req.params.personneId;
        const relations = await Relation_1.default.find({
            familleId: req.familleId,
            $or: [{ personne1: personneId }, { personne2: personneId }],
        })
            .populate("personne1", "nom prenom photo dateNaissance dateDeces")
            .populate("personne2", "nom prenom photo dateNaissance dateDeces");
        res.status(200).json(relations);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des relations", error });
    }
};
exports.getRelationsByPersonne = getRelationsByPersonne;
const createRelation = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { type, personne1, personne2, dateDebut, dateFin, details } = req.body;
        // Vérifier que les personnes existent et appartiennent à la même famille
        const [personne1Existe, personne2Existe] = await Promise.all([
            Personne_1.default.findOne({ _id: personne1, familleId: req.familleId }),
            Personne_1.default.findOne({ _id: personne2, familleId: req.familleId }),
        ]);
        if (!personne1Existe || !personne2Existe) {
            res
                .status(404)
                .json({ message: "Une ou plusieurs personnes non trouvées" });
            return;
        }
        // Vérifier qu'une relation similaire n'existe pas déjà
        const relationExistante = await Relation_1.default.findOne({
            familleId: req.familleId,
            $or: [
                { personne1, personne2, type },
                { personne1: personne2, personne2: personne1, type },
            ],
        });
        if (relationExistante) {
            const p1 = personne1Existe;
            const p2 = personne2Existe;
            const typeLabels = {
                parent: "parent-enfant",
                enfant: "enfant-parent",
                conjoint: "de conjoint",
                frere_soeur: "frère/sœur",
            };
            const typeLabel = typeLabels[type] || type;
            res.status(400).json({
                message: `Une relation ${typeLabel} existe déjà entre ${p1.prenom} ${p1.nom} et ${p2.prenom} ${p2.nom}`,
            });
            return;
        }
        const nouvelleRelation = new Relation_1.default({
            type,
            personne1,
            personne2,
            dateDebut: dateDebut || new Date(),
            dateFin,
            details,
            familleId: req.familleId,
        });
        await nouvelleRelation.save();
        // Si c'est une relation parent-enfant, créer automatiquement les relations frère/sœur
        if (type === "parent" || type === "enfant") {
            const parentId = type === "parent" ? personne1 : personne2;
            const enfantId = type === "parent" ? personne2 : personne1;
            // Trouver tous les autres enfants de ce parent
            const autresEnfants = await Relation_1.default.find({
                familleId: req.familleId,
                $or: [
                    { type: "parent", personne1: parentId, personne2: { $ne: enfantId } },
                    { type: "enfant", personne2: parentId, personne1: { $ne: enfantId } },
                ],
            });
            // Créer les relations frère/sœur avec chaque autre enfant
            for (const relation of autresEnfants) {
                const autreEnfantId = relation.type === "parent" ? relation.personne2 : relation.personne1;
                // Vérifier si la relation frère/sœur existe déjà
                const relationFrereSoeurExiste = await Relation_1.default.findOne({
                    familleId: req.familleId,
                    type: "frere_soeur",
                    $or: [
                        { personne1: enfantId, personne2: autreEnfantId },
                        { personne1: autreEnfantId, personne2: enfantId },
                    ],
                });
                if (!relationFrereSoeurExiste) {
                    await Relation_1.default.create({
                        type: "frere_soeur",
                        personne1: enfantId,
                        personne2: autreEnfantId,
                        dateDebut: new Date(),
                        familleId: req.familleId,
                        details: "Relation automatique créée par lien parental commun",
                    });
                }
            }
        }
        // Populer les données des personnes pour la réponse
        const relationPopulee = await Relation_1.default.findById(nouvelleRelation._id)
            .populate("personne1", "nom prenom")
            .populate("personne2", "nom prenom");
        res.status(201).json(relationPopulee);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la création de la relation", error });
    }
};
exports.createRelation = createRelation;
const updateRelation = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { type, dateDebut, dateFin, details } = req.body;
        const relation = await Relation_1.default.findOneAndUpdate({ _id: req.params.id, familleId: req.familleId }, {
            type,
            dateDebut,
            dateFin,
            details,
        }, { new: true, runValidators: true })
            .populate("personne1", "nom prenom")
            .populate("personne2", "nom prenom");
        if (!relation) {
            res.status(404).json({ message: "Relation non trouvée" });
            return;
        }
        res.status(200).json(relation);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la mise à jour de la relation", error });
    }
};
exports.updateRelation = updateRelation;
const deleteRelation = async (req, res) => {
    try {
        const relation = await Relation_1.default.findOneAndDelete({
            _id: req.params.id,
            familleId: req.familleId,
        });
        if (!relation) {
            res.status(404).json({ message: "Relation non trouvée" });
            return;
        }
        res.status(200).json({ message: "Relation supprimée avec succès" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la suppression de la relation", error });
    }
};
exports.deleteRelation = deleteRelation;
const getFamille = async (req, res) => {
    try {
        const personneId = req.params.personneId;
        // Vérifier que la personne existe
        const personne = await Personne_1.default.findOne({
            _id: personneId,
            familleId: req.familleId,
        });
        if (!personne) {
            res.status(404).json({ message: "Personne non trouvée" });
            return;
        }
        // Récupérer toutes les relations de la personne avec les données des personnes peuplées
        const relations = await Relation_1.default.find({
            familleId: req.familleId,
            $or: [{ personne1: personneId }, { personne2: personneId }],
        })
            .populate("personne1", "nom prenom photo dateNaissance dateDeces")
            .populate("personne2", "nom prenom photo dateNaissance dateDeces");
        // Structure de données pour la réponse
        const famille = {
            personne: {
                _id: personne._id,
                nom: personne.nom,
                prenom: personne.prenom,
                photo: personne.photo,
                dateNaissance: personne.dateNaissance,
                dateDeces: personne.dateDeces,
            },
            parents: [],
            conjoints: [],
            enfants: [],
            freresSoeurs: [],
        };
        // Organiser les relations
        for (const relation of relations) {
            const autrePersonneId = relation.personne1.toString() === personneId
                ? relation.personne2
                : relation.personne1;
            // Vérifier le type de l'autre personne et accéder aux propriétés en toute sécurité
            let autrePersonne = null;
            if (relation.personne1.toString() === personneId) {
                autrePersonne =
                    relation.personne2 &&
                        typeof relation.personne2 === "object" &&
                        "nom" in relation.personne2
                        ? relation.personne2
                        : null;
            }
            else {
                autrePersonne =
                    relation.personne1 &&
                        typeof relation.personne1 === "object" &&
                        "nom" in relation.personne1
                        ? relation.personne1
                        : null;
            }
            if (!autrePersonne)
                continue; // Passer à la prochaine itération si l'autre personne n'est pas valide
            const relationInfo = {
                _id: relation._id,
                type: relation.type,
                dateDebut: relation.dateDebut,
                dateFin: relation.dateFin,
                details: relation.details,
                personne: {
                    _id: autrePersonne._id,
                    nom: autrePersonne.nom,
                    prenom: autrePersonne.prenom,
                    ...(autrePersonne.photo && { photo: autrePersonne.photo }),
                    ...(autrePersonne.dateNaissance && {
                        dateNaissance: autrePersonne.dateNaissance,
                    }),
                    ...(autrePersonne.dateDeces && {
                        dateDeces: autrePersonne.dateDeces,
                    }),
                },
            };
            if (relation.type === "parent") {
                famille.parents.push(relationInfo);
            }
            else if (relation.type === "conjoint") {
                famille.conjoints.push(relationInfo);
            }
            else if (relation.type === "enfant") {
                famille.enfants.push(relationInfo);
            }
            else if (relation.type === "frere_soeur") {
                famille.freresSoeurs.push(relationInfo);
            }
        }
        res.status(200).json(famille);
    }
    catch (error) {
        console.error("Erreur lors de la récupération de la famille:", error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération de la famille", error });
    }
};
exports.getFamille = getFamille;
