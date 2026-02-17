"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/adminRoutes.ts
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Donnees invalides",
            errors: errors.array(),
        });
    }
    next();
};
const createUserValidation = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email invalide"),
    (0, express_validator_1.body)("password")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Le mot de passe doit contenir au moins 8 caracteres"),
    (0, express_validator_1.body)("nom").trim().notEmpty().withMessage("Le nom est requis"),
    (0, express_validator_1.body)("prenom").trim().notEmpty().withMessage("Le prenom est requis"),
    (0, express_validator_1.body)("role")
        .isIn(["admin", "membre", "lecteur"])
        .withMessage("Role invalide"),
    (0, express_validator_1.body)("familleId").optional().isMongoId().withMessage("familleId invalide"),
    (0, express_validator_1.body)("nomFamille")
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage("nomFamille invalide"),
    (0, express_validator_1.body)().custom((value) => {
        if (!value.familleId && !value.nomFamille) {
            throw new Error("familleId ou nomFamille est requis");
        }
        return true;
    }),
    validateRequest,
];
const updateUserValidation = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("ID utilisateur invalide"),
    (0, express_validator_1.body)("email").optional().isEmail().withMessage("Email invalide"),
    (0, express_validator_1.body)("nom")
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Nom invalide"),
    (0, express_validator_1.body)("prenom")
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Prenom invalide"),
    (0, express_validator_1.body)("role")
        .optional()
        .isIn(["admin", "membre", "lecteur"])
        .withMessage("Role invalide"),
    (0, express_validator_1.body)("familleId").optional().isMongoId().withMessage("familleId invalide"),
    validateRequest,
];
const idParamValidation = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("ID invalide"),
    validateRequest,
];
const createFamilleValidation = [
    (0, express_validator_1.body)("nom")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Le nom de la famille est requis"),
    (0, express_validator_1.body)("description")
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage("Description invalide"),
    validateRequest,
];
// Toutes les routes nécessitent l'authentification et le rôle admin
router.use(auth_1.protect);
router.use((0, auth_1.authorize)("admin"));
// Routes utilisateurs
router.get("/users", adminController_1.getAllUsers);
router.post("/users", createUserValidation, adminController_1.createUser);
router.put("/users/:id", updateUserValidation, adminController_1.updateUser);
router.delete("/users/:id", idParamValidation, adminController_1.deleteUser);
// Routes familles
router.get("/familles", adminController_1.getAllFamilles);
router.post("/familles", createFamilleValidation, adminController_1.createFamille);
router.delete("/familles/:id", idParamValidation, adminController_1.deleteFamille);
exports.default = router;
