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
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const relationController = __importStar(require("../controllers/relationController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Toutes les routes sont protégées par authentification
router.use(auth_1.protect);
// Validation des données
const validateRelation = [
    (0, express_validator_1.body)('type').isIn(['parent', 'conjoint', 'enfant', 'frere_soeur', 'mariage', 'divorce', 'fiançailles'])
        .withMessage('Type de relation invalide'),
    (0, express_validator_1.body)('personne1').isMongoId().withMessage('ID de la première personne invalide'),
    (0, express_validator_1.body)('personne2').isMongoId().withMessage('ID de la deuxième personne invalide'),
    (0, express_validator_1.body)('dateDebut').optional().isISO8601().withMessage('Format de date invalide (format ISO)'),
    (0, express_validator_1.body)('dateFin').optional().isISO8601().withMessage('Format de date invalide (format ISO)'),
    (0, express_validator_1.body)('details').optional().isString().withMessage('Les détails doivent être une chaîne de caractères')
];
// Routes pour les relations
router.get('/', relationController.getRelations);
router.get('/personne/:personneId', relationController.getRelationsByPersonne);
router.get('/famille/:personneId', relationController.getFamille);
// Routes d'écriture (membres et admins seulement)
router.post('/', (0, auth_1.authorize)('admin', 'membre'), [...validateRelation], relationController.createRelation);
router.put('/:id', (0, auth_1.authorize)('admin', 'membre'), [...validateRelation], relationController.updateRelation);
router.delete('/:id', (0, auth_1.authorize)('admin', 'membre'), relationController.deleteRelation);
exports.default = router;
