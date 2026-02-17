"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Middleware pour vérifier le token JWT
const protect = async (req, res, next) => {
    let token;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({
            success: false,
            message: "Configuration serveur invalide: JWT_SECRET manquant",
        });
    }
    // Vérifier si le token est dans le header Authorization
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extraire le token du header "Bearer TOKEN"
            token = req.headers.authorization.split(" ")[1];
            // Vérifier et décoder le token
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            // Récupérer l'utilisateur sans le mot de passe
            const user = await User_1.default.findById(decoded.id).select("-password");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Utilisateur non trouvé",
                });
            }
            // Attacher l'utilisateur et la famille à la requête
            req.user = user;
            req.familleId = user.familleId.toString();
            next();
        }
        catch (error) {
            console.error("Erreur d'authentification:", error);
            return res.status(401).json({
                success: false,
                message: "Token invalide ou expiré",
            });
        }
    }
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Accès non autorisé - Aucun token fourni",
        });
    }
};
exports.protect = protect;
// Middleware pour vérifier le rôle
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Non authentifié",
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`,
            });
        }
        next();
    };
};
exports.authorize = authorize;
// Générer un token JWT
const generateToken = (id) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ||
        "30d");
    if (!jwtSecret) {
        throw new Error("Configuration serveur invalide: JWT_SECRET manquant");
    }
    return jsonwebtoken_1.default.sign({ id }, jwtSecret, {
        expiresIn: jwtExpiresIn,
    });
};
exports.generateToken = generateToken;
