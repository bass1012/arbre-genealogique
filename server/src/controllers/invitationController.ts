// src/controllers/invitationController.ts
import { Request, Response } from 'express';
import Invitation from '../models/Invitation';
import User from '../models/User';
import Famille from '../models/Famille';
import { generateToken, AuthRequest } from '../middleware/auth';

// @desc    Créer une invitation
// @route   POST /api/invitations
// @access  Private (admin, membre)
export const createInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role = 'membre' } = req.body;
    const userId = req.user?._id;
    const familleId = req.familleId;

    // Vérifier que l'utilisateur est admin ou membre
    const currentUser = await User.findById(userId);
    if (!currentUser || currentUser.role === 'lecteur') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les droits pour inviter des membres'
      });
    }

    // Seul un admin peut créer des invitations avec rôle membre
    // Un membre ne peut inviter que des lecteurs
    let inviteRole = role;
    if (currentUser.role === 'membre' && role === 'membre') {
      inviteRole = 'lecteur';
    }

    const invitation = await Invitation.create({
      familleId,
      createdBy: userId,
      email: email || undefined,
      role: inviteRole
    });

    // Générer l'URL d'invitation
    const inviteUrl = `${process.env.FRONTEND_URL || 'https://www.arbre-genealogique.allsite.cloud'}/rejoindre/${invitation.code}`;

    res.status(201).json({
      success: true,
      data: {
        invitation: {
          id: invitation._id,
          code: invitation.code,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          url: inviteUrl
        }
      },
      message: 'Invitation créée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur création invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'invitation',
      error: error.message
    });
  }
};

// @desc    Lister les invitations de la famille
// @route   GET /api/invitations
// @access  Private (admin, membre)
export const getInvitations = async (req: AuthRequest, res: Response) => {
  try {
    const familleId = req.familleId;

    const invitations = await Invitation.find({ familleId })
      .populate('createdBy', 'nom prenom email')
      .populate('usedBy', 'nom prenom email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invitations
    });
  } catch (error: any) {
    console.error('Erreur récupération invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des invitations',
      error: error.message
    });
  }
};

// @desc    Vérifier une invitation (public - pour afficher le formulaire)
// @route   GET /api/invitations/verify/:code
// @access  Public
export const verifyInvitation = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const invitation = await Invitation.findOne({ code })
      .populate('familleId', 'nom description');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation non trouvée'
      });
    }

    if (!invitation.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cette invitation a déjà été utilisée'
      });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Cette invitation a expiré'
      });
    }

    const famille = invitation.familleId as any;

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        famille: {
          nom: famille.nom,
          description: famille.description
        },
        role: invitation.role,
        email: invitation.email,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error: any) {
    console.error('Erreur vérification invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
};

// @desc    Utiliser une invitation pour rejoindre une famille
// @route   POST /api/invitations/join/:code
// @access  Public
export const joinWithInvitation = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { email, password, nom, prenom } = req.body;

    // Validation
    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Vérifier l'invitation
    const invitation = await Invitation.findOne({ code, isActive: true });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation non trouvée ou déjà utilisée'
      });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Cette invitation a expiré'
      });
    }

    // Vérifier si l'email correspond (si spécifié dans l'invitation)
    if (invitation.email && invitation.email !== email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Cette invitation est réservée à une autre adresse email'
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

    // Créer le nouvel utilisateur
    const user = await User.create({
      email,
      password,
      nom,
      prenom,
      familleId: invitation.familleId,
      role: invitation.role
    });

    // Marquer l'invitation comme utilisée
    invitation.isActive = false;
    invitation.usedBy = user._id;
    invitation.usedAt = new Date();
    await invitation.save();

    // Récupérer la famille
    const famille = await Famille.findById(invitation.familleId);

    // Générer le token
    const token = generateToken(user._id.toString(), invitation.familleId.toString());

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
        famille: famille ? {
          id: famille._id,
          nom: famille.nom,
          description: famille.description
        } : null
      },
      message: 'Bienvenue dans la famille !'
    });
  } catch (error: any) {
    console.error('Erreur rejoindre famille:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// @desc    Révoquer une invitation
// @route   DELETE /api/invitations/:id
// @access  Private (gestionnaire/superadmin)
export const revokeInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const familleId = req.familleId;

    // Vérifier que l'utilisateur est gestionnaire ou superadmin
    const currentUser = await User.findById(userId);
    if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'gestionnaire')) {
      return res.status(403).json({
        success: false,
        message: 'Seul un administrateur peut révoquer une invitation'
      });
    }

    const invitation = await Invitation.findOneAndDelete({
      _id: id,
      familleId,
      isActive: true
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation révoquée'
    });
  } catch (error: any) {
    console.error('Erreur révocation invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la révocation',
      error: error.message
    });
  }
};

// @desc    Lister les membres de la famille
// @route   GET /api/invitations/members
// @access  Private
export const getFamilyMembers = async (req: AuthRequest, res: Response) => {
  try {
    const familleId = req.familleId;

    const members = await User.find({ familleId })
      .select('nom prenom email role createdAt')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error: any) {
    console.error('Erreur récupération membres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des membres',
      error: error.message
    });
  }
};
