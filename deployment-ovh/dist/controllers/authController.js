"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteMember = exports.getMe = exports.login = exports.register = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Famille_1 = __importDefault(require("../models/Famille"));
const auth_1 = require("../middleware/auth");
// @desc    Inscription d'un nouvel utilisateur et création de sa famille
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { email, password, nom, prenom, nomFamille, descriptionFamille } = req.body;
        // Validation des champs
        if (!email || !password || !nom || !prenom || !nomFamille) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs requis doivent être remplis'
            });
        }
        // Vérifier si l'email existe déjà
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Un compte avec cet email existe déjà'
            });
        }
        // Créer la famille d'abord
        const famille = await Famille_1.default.create({
            nom: nomFamille,
            description: descriptionFamille || '',
            createdBy: new mongoose_1.default.Types.ObjectId() // ID temporaire
        });
        // Créer l'utilisateur avec le rôle admin (premier utilisateur de la famille)
        const user = await User_1.default.create({
            email,
            password,
            nom,
            prenom,
            familleId: famille._id,
            role: 'admin'
        });
        // Mettre à jour la famille avec l'ID du créateur
        await Famille_1.default.findByIdAndUpdate(famille._id, { createdBy: user._id });
        // Générer le token JWT
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    nom: user.nom,
                    prenom: user.prenom,
                    role: user.role
                },
                famille: {
                    id: famille._id,
                    nom: famille.nom,
                    description: famille.description
                }
            },
            message: 'Compte créé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du compte',
            error: error.message
        });
    }
};
exports.register = register;
// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }
        // Chercher l'utilisateur avec le mot de passe (select: false par défaut)
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }
        // Vérifier le mot de passe
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }
        // Récupérer les infos de la famille
        const famille = await Famille_1.default.findById(user.familleId);
        // Générer le token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    nom: user.nom,
                    prenom: user.prenom,
                    role: user.role
                },
                famille: famille ? {
                    id: famille._id,
                    nom: famille.nom,
                    description: famille.description
                } : null
            },
            message: 'Connexion réussie'
        });
    }
    catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion',
            error: error.message
        });
    }
};
exports.login = login;
// @desc    Récupérer les informations de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        const famille = await Famille_1.default.findById(user === null || user === void 0 ? void 0 : user.familleId);
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user === null || user === void 0 ? void 0 : user._id,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    nom: user === null || user === void 0 ? void 0 : user.nom,
                    prenom: user === null || user === void 0 ? void 0 : user.prenom,
                    role: user === null || user === void 0 ? void 0 : user.role
                },
                famille: famille ? {
                    id: famille._id,
                    nom: famille.nom,
                    description: famille.description
                } : null
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        });
    }
};
exports.getMe = getMe;
// @desc    Inviter un membre à rejoindre la famille
// @route   POST /api/auth/invite
// @access  Private (admin seulement)
const inviteMember = async (req, res) => {
    try {
        const { email, nom, prenom, role } = req.body;
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Seul un administrateur peut inviter des membres'
            });
        }
        // Vérifier si l'email existe déjà
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Un compte avec cet email existe déjà'
            });
        }
        // Créer un mot de passe temporaire (à changer lors de la première connexion)
        const tempPassword = Math.random().toString(36).slice(-8);
        // Créer le nouvel utilisateur dans la même famille
        const newUser = await User_1.default.create({
            email,
            password: tempPassword,
            nom,
            prenom,
            familleId: req.user.familleId,
            role: role || 'membre'
        });
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    nom: newUser.nom,
                    prenom: newUser.prenom,
                    role: newUser.role
                },
                tempPassword // À envoyer par email dans une vraie app
            },
            message: 'Membre invité avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'invitation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'invitation',
            error: error.message
        });
    }
};
exports.inviteMember = inviteMember;
