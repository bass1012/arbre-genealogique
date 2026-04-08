// src/routes/authRoutes.ts
import express from "express";
import { body, validationResult } from "express-validator";
import {
  register,
  login,
  getMe,
  inviteMember,
  updateProfile,
  changePassword,
  updateFamille,
} from "../controllers/authController";
import { protect, authorize } from "../middleware/auth";
import { createRateLimiter } from "../middleware/rateLimit";

const router = express.Router();
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Trop de tentatives de connexion. Reessayez plus tard.",
});

const validateRequest = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const errors = validationResult(req);
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
  body("email").isEmail().withMessage("Email invalide"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Mot de passe invalide"),
  validateRequest,
];

const registerValidation = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caracteres"),
  body("nom").trim().notEmpty().withMessage("Le nom est requis"),
  body("prenom").trim().notEmpty().withMessage("Le prenom est requis"),
  body("nomFamille")
    .trim()
    .notEmpty()
    .withMessage("Le nom de famille est requis"),
  body("descriptionFamille")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description de famille invalide"),
  validateRequest,
];

const inviteValidation = [
  body("email").isEmail().withMessage("Email invalide"),
  body("nom").trim().notEmpty().withMessage("Le nom est requis"),
  body("prenom").trim().notEmpty().withMessage("Le prenom est requis"),
  body("role")
    .optional()
    .isIn(["admin", "membre", "lecteur"])
    .withMessage("Role invalide"),
  validateRequest,
];

// Routes publiques
router.post("/login", loginRateLimiter, loginValidation, login);
router.post("/register", registerValidation, register);

// Routes protégées
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.post(
  "/invite",
  protect,
  authorize("admin"),
  inviteValidation,
  inviteMember,
);

export default router;
