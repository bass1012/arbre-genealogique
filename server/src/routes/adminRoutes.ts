// src/routes/adminRoutes.ts
import express from "express";
import { body, param, validationResult } from "express-validator";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllFamilles,
  createFamille,
  deleteFamille,
} from "../controllers/adminController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

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

const createUserValidation = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caracteres"),
  body("nom").trim().notEmpty().withMessage("Le nom est requis"),
  body("prenom").trim().notEmpty().withMessage("Le prenom est requis"),
  body("role")
    .isIn(["admin", "membre", "lecteur"])
    .withMessage("Role invalide"),
  body("familleId").optional().isMongoId().withMessage("familleId invalide"),
  body("nomFamille")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("nomFamille invalide"),
  body().custom((value) => {
    if (!value.familleId && !value.nomFamille) {
      throw new Error("familleId ou nomFamille est requis");
    }
    return true;
  }),
  validateRequest,
];

const updateUserValidation = [
  param("id").isMongoId().withMessage("ID utilisateur invalide"),
  body("email").optional().isEmail().withMessage("Email invalide"),
  body("nom")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Nom invalide"),
  body("prenom")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Prenom invalide"),
  body("role")
    .optional()
    .isIn(["admin", "membre", "lecteur"])
    .withMessage("Role invalide"),
  body("familleId").optional().isMongoId().withMessage("familleId invalide"),
  validateRequest,
];

const idParamValidation = [
  param("id").isMongoId().withMessage("ID invalide"),
  validateRequest,
];

const createFamilleValidation = [
  body("nom")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le nom de la famille est requis"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description invalide"),
  validateRequest,
];

// Toutes les routes nécessitent l'authentification et le rôle admin
router.use(protect);
router.use(authorize("admin"));

// Routes utilisateurs
router.get("/users", getAllUsers);
router.post("/users", createUserValidation, createUser);
router.put("/users/:id", updateUserValidation, updateUser);
router.delete("/users/:id", idParamValidation, deleteUser);

// Routes familles
router.get("/familles", getAllFamilles);
router.post("/familles", createFamilleValidation, createFamille);
router.delete("/familles/:id", idParamValidation, deleteFamille);

export default router;
