// src/controllers/authController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Famille from '../models/Famille';
import { generateToken } from '../middleware/auth';

// @desc    Inscription d'un nouvel utilisateur et création de sa famille
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
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
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Créer la famille d'abord
    const famille = await Famille.create({
      nom: nomFamille,
      description: descriptionFamille || '',
      createdBy: new mongoose.Types.ObjectId() // ID temporaire
    });

    // Créer l'utilisateur avec le rôle gestionnaire (créateur de la famille)
    const user = await User.create({
      email,
      password,
      nom,
      prenom,
      familleId: famille._id,
      role: 'gestionnaire'
    });

    // Mettre à jour la famille avec l'ID du créateur
    await Famille.findByIdAndUpdate(famille._id, { createdBy: user._id });

    // Générer le token JWT
    const token = generateToken(user._id.toString(), famille._id.toString());

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
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
      error: error.message
    });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
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
    const user = await User.findOne({ email }).select('+password');

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
    const famille = await Famille.findById(user.familleId);

    // Générer le token
    const token = generateToken(user._id.toString(), user.familleId?.toString());

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
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// @desc    Récupérer les informations de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    const famille = await Famille.findById(user?.familleId);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user?._id,
          email: user?.email,
          nom: user?.nom,
          prenom: user?.prenom,
          role: user?.role
        },
        famille: famille ? {
          id: famille._id,
          nom: famille.nom,
          description: famille.description
        } : null
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// @desc    Inviter un membre à rejoindre la famille
// @route   POST /api/auth/invite
// @access  Private (gestionnaire/superadmin seulement)
export const inviteMember = async (req: any, res: Response) => {
  try {
    const { email, nom, prenom, role } = req.body;

    // Vérifier que l'utilisateur est gestionnaire ou superadmin
    if (req.user.role !== 'superadmin' && req.user.role !== 'gestionnaire') {
      return res.status(403).json({
        success: false,
        message: 'Seul un administrateur peut inviter des membres'
      });
    }

    // Vérifier si l'email existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Créer un mot de passe temporaire (à changer lors de la première connexion)
    const tempPassword = Math.random().toString(36).slice(-8);

    // Créer le nouvel utilisateur dans la même famille
    const newUser = await User.create({
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
  } catch (error: any) {
    console.error('Erreur lors de l\'invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'invitation',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { nom, prenom, email } = req.body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { nom, prenom, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: updatedUser?._id,
          email: updatedUser?.email,
          nom: updatedUser?.nom,
          prenom: updatedUser?.prenom,
          role: updatedUser?.role
        }
      },
      message: 'Profil mis à jour avec succès'
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error: any) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les informations de la famille
// @route   PUT /api/famille
// @access  Private
export const updateFamille = async (req: any, res: Response) => {
  try {
    const { nom, description } = req.body;

    if (!nom) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la famille est requis'
      });
    }

    const famille = await Famille.findByIdAndUpdate(
      req.user.familleId,
      { nom, description },
      { new: true, runValidators: true }
    );

    if (!famille) {
      return res.status(404).json({
        success: false,
        message: 'Famille non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        famille: {
          id: famille._id,
          nom: famille.nom,
          description: famille.description
        }
      },
      message: 'Informations de la famille mises à jour'
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la famille:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la famille',
      error: error.message
    });
  }
};
