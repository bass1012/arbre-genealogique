"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDocument = exports.validatePersonne = void 0;
const express_validator_1 = require("express-validator");
exports.validatePersonne = [
    (0, express_validator_1.body)('nom').trim().notEmpty().withMessage('Le nom est requis'),
    (0, express_validator_1.body)('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
    (0, express_validator_1.body)('dateNaissance').optional().isISO8601().withMessage('Date de naissance invalide'),
    (0, express_validator_1.body)('dateDeces').optional().isISO8601().withMessage('Date de décès invalide'),
    (0, express_validator_1.body)('genre').optional().isIn(['homme', 'femme', 'autre']).withMessage('Genre invalide'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email invalide'),
    (0, express_validator_1.body)('dateDeces').custom((dateDeces, { req }) => {
        if (dateDeces && req.body.dateNaissance) {
            const naissance = new Date(req.body.dateNaissance);
            const deces = new Date(dateDeces);
            if (deces <= naissance) {
                throw new Error('La date de décès doit être postérieure à la date de naissance');
            }
        }
        return true;
    }),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
exports.validateDocument = [
    (0, express_validator_1.body)('type').isIn([
        'acte_naissance',
        'acte_deces',
        'acte_mariage',
        'photo',
        'diplome',
        'contrat_travail',
        'document_identite',
        'certificat',
        'autre'
    ]).withMessage('Type de document invalide'),
    (0, express_validator_1.body)('titre').trim().notEmpty().withMessage('Le titre est requis'),
    (0, express_validator_1.body)('date').optional().isISO8601().withMessage('Date invalide'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
