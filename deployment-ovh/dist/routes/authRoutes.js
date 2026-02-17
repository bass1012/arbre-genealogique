"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = express_1.default.Router();
const loginRateLimiter = (0, rateLimit_1.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Trop de tentatives de connexion. Reessayez plus tard.",
});
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
const loginValidation = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email invalide"),
    (0, express_validator_1.body)("password")
        .isString()
        .isLength({ min: 6 })
        .withMessage("Mot de passe invalide"),
    validateRequest,
];
const registerValidation = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email invalide"),
    (0, express_validator_1.body)("password")
        .isString()
        .isLength({ min: 8 })
        .withMessage("Le mot de passe doit contenir au moins 8 caracteres"),
    (0, express_validator_1.body)("nom").trim().notEmpty().withMessage("Le nom est requis"),
    (0, express_validator_1.body)("prenom").trim().notEmpty().withMessage("Le prenom est requis"),
    (0, express_validator_1.body)("nomFamille")
        .trim()
        .notEmpty()
        .withMessage("Le nom de famille est requis"),
    (0, express_validator_1.body)("descriptionFamille")
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage("Description de famille invalide"),
    validateRequest,
];
const inviteValidation = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email invalide"),
    (0, express_validator_1.body)("nom").trim().notEmpty().withMessage("Le nom est requis"),
    (0, express_validator_1.body)("prenom").trim().notEmpty().withMessage("Le prenom est requis"),
    (0, express_validator_1.body)("role")
        .optional()
        .isIn(["admin", "membre", "lecteur"])
        .withMessage("Role invalide"),
    validateRequest,
];
// Routes publiques
router.post("/login", loginRateLimiter, loginValidation, authController_1.login);
// Routes protégées (admin seulement pour register maintenant)
router.post("/register", auth_1.protect, (0, auth_1.authorize)("admin"), registerValidation, authController_1.register);
router.get("/me", auth_1.protect, authController_1.getMe);
router.post("/invite", auth_1.protect, (0, auth_1.authorize)("admin"), inviteValidation, authController_1.inviteMember);
exports.default = router;
