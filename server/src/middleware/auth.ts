// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Extension de l'interface Request pour inclure user
export interface AuthRequest extends Request {
  user?: IUser;
  familleId?: string;
}

// Middleware pour vérifier le token JWT
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: "Configuration serveur invalide: JWT_SECRET manquant",
    });
  }

  // Vérifier si le token est dans le header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extraire le token du header "Bearer TOKEN"
      token = req.headers.authorization.split(" ")[1];

      // Vérifier et décoder le token
      const decoded: any = jwt.verify(token, jwtSecret);

      // Récupérer l'utilisateur sans le mot de passe
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Attacher l'utilisateur et la famille à la requête
      req.user = user;
      // Utiliser familleId du token si disponible, sinon celle de l'utilisateur
      req.familleId = decoded.familleId || user.familleId?.toString();

      next();
    } catch (error) {
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

// Middleware pour vérifier le rôle
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

// Générer un token JWT
export const generateToken = (id: string, familleId?: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ||
    "30d") as jwt.SignOptions["expiresIn"];

  if (!jwtSecret) {
    throw new Error("Configuration serveur invalide: JWT_SECRET manquant");
  }

  const payload: any = { id };
  if (familleId) {
    payload.familleId = familleId;
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};
