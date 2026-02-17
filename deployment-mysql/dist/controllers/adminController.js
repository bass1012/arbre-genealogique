"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFamille = exports.createFamille = exports.getAllFamilles = exports.deleteUser = exports.updateUser = exports.createUser = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Famille_1 = __importDefault(require("../models/Famille"));
const Personne_1 = __importDefault(require("../models/Personne"));
const Relation_1 = __importDefault(require("../models/Relation"));
// @desc    Obtenir tous les utilisateurs (admin seulement)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find()
            .populate('familleId', 'nom')
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
};
exports.getAllUsers = getAllUsers;
// @desc    Créer un utilisateur (admin seulement)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    var _a;
    try {
        const { email, password, nom, prenom, role, familleId, nomFamille } = req.body;
        // Validation
        if (!email || !password || !nom || !prenom || !role) {
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
        let famille;
        // Si nomFamille est fourni, créer une nouvelle famille
        if (nomFamille) {
            famille = await Famille_1.default.create({
                nom: nomFamille,
                description: `Famille de ${prenom} ${nom}`,
                createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
            });
        }
        else if (familleId) {
            // Sinon, vérifier que la famille existe
            famille = await Famille_1.default.findById(familleId);
            if (!famille) {
                return res.status(404).json({
                    success: false,
                    message: 'Famille non trouvée'
                });
            }
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Nom de famille ou ID de famille requis'
            });
        }
        // Créer l'utilisateur
        const user = await User_1.default.create({
            email,
            password,
            nom,
            prenom,
            role,
            familleId: famille._id
        });
        // Mettre à jour le créateur de la famille si c'était une nouvelle famille
        if (nomFamille) {
            await Famille_1.default.findByIdAndUpdate(famille._id, { createdBy: user._id });
        }
        // Retourner l'utilisateur sans le mot de passe
        const userWithoutPassword = await User_1.default.findById(user._id)
            .populate('familleId', 'nom')
            .select('-password');
        res.status(201).json({
            success: true,
            data: userWithoutPassword,
            message: 'Utilisateur créé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'utilisateur',
            error: error.message
        });
    }
};
exports.createUser = createUser;
// @desc    Mettre à jour un utilisateur (admin seulement)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, nom, prenom, role, familleId } = req.body;
        // Trouver l'utilisateur
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email && email !== user.email) {
            const emailExists = await User_1.default.findOne({ email, _id: { $ne: id } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Cet email est déjà utilisé'
                });
            }
        }
        // Mettre à jour les champs
        if (email)
            user.email = email;
        if (nom)
            user.nom = nom;
        if (prenom)
            user.prenom = prenom;
        if (role)
            user.role = role;
        if (familleId)
            user.familleId = familleId;
        await user.save();
        // Retourner l'utilisateur mis à jour sans le mot de passe
        const updatedUser = await User_1.default.findById(user._id)
            .populate('familleId', 'nom')
            .select('-password');
        res.json({
            success: true,
            data: updatedUser,
            message: 'Utilisateur mis à jour avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'utilisateur',
            error: error.message
        });
    }
};
exports.updateUser = updateUser;
// @desc    Supprimer un utilisateur (admin seulement)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        await user.deleteOne();
        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur',
            error: error.message
        });
    }
};
exports.deleteUser = deleteUser;
// @desc    Obtenir toutes les familles (admin seulement)
// @route   GET /api/admin/familles
// @access  Private/Admin
const getAllFamilles = async (req, res) => {
    try {
        const familles = await Famille_1.default.find()
            .populate('createdBy', 'nom prenom')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: familles
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des familles:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des familles',
            error: error.message
        });
    }
};
exports.getAllFamilles = getAllFamilles;
// @desc    Créer une famille (admin seulement)
// @route   POST /api/admin/familles
// @access  Private/Admin
const createFamille = async (req, res) => {
    var _a;
    try {
        const { nom, description } = req.body;
        if (!nom) {
            return res.status(400).json({
                success: false,
                message: 'Le nom de la famille est requis'
            });
        }
        const famille = await Famille_1.default.create({
            nom,
            description: description || '',
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        const populatedFamille = await Famille_1.default.findById(famille._id)
            .populate('createdBy', 'nom prenom');
        res.status(201).json({
            success: true,
            data: populatedFamille,
            message: 'Famille créée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de la famille:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la famille',
            error: error.message
        });
    }
};
exports.createFamille = createFamille;
// @desc    Supprimer une famille (admin seulement)
// @route   DELETE /api/admin/familles/:id
// @access  Private/Admin
const deleteFamille = async (req, res) => {
    try {
        const { id } = req.params;
        const famille = await Famille_1.default.findById(id);
        if (!famille) {
            return res.status(404).json({
                success: false,
                message: 'Famille non trouvée'
            });
        }
        // Supprimer tous les utilisateurs de cette famille
        await User_1.default.deleteMany({ familleId: id });
        // Supprimer toutes les personnes de cette famille
        await Personne_1.default.deleteMany({ familleId: id });
        // Supprimer toutes les relations de cette famille
        await Relation_1.default.deleteMany({ familleId: id });
        // Supprimer la famille
        await famille.deleteOne();
        res.json({
            success: true,
            message: 'Famille et toutes les données associées supprimées avec succès'
        });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de la famille:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la famille',
            error: error.message
        });
    }
};
exports.deleteFamille = deleteFamille;
