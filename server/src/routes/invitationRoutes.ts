// src/routes/invitationRoutes.ts
import express from 'express';
import {
  createInvitation,
  getInvitations,
  verifyInvitation,
  joinWithInvitation,
  revokeInvitation,
  getFamilyMembers
} from '../controllers/invitationController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Routes publiques (pour rejoindre)
router.get('/verify/:code', verifyInvitation);
router.post('/join/:code', joinWithInvitation);

// Routes protégées
router.use(protect);

// Lister les membres de la famille
router.get('/members', getFamilyMembers);

// Créer et lister les invitations (admin et membre seulement)
router.post('/', authorize('admin', 'membre'), createInvitation);
router.get('/', authorize('admin', 'membre'), getInvitations);

// Révoquer une invitation (admin seulement)
router.delete('/:id', authorize('admin'), revokeInvitation);

export default router;
