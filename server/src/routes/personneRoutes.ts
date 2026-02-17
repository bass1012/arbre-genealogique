import { Router } from 'express';
import * as personneController from '../controllers/personneController';
import { validatePersonne } from '../middleware/validation';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Toutes les routes sont protégées par authentification
router.use(protect);

// Routes pour les personnes
router.get('/', personneController.getPersonnes);
router.get('/search', personneController.searchPersonnes);
router.get('/:id', personneController.getPersonne);
router.get('/:id/arbre', personneController.getArbreGenealogique);

// Routes d'écriture (membres et admins seulement)
router.post('/', authorize('admin', 'membre'), validatePersonne, personneController.createPersonne);
router.put('/:id', authorize('admin', 'membre'), validatePersonne, personneController.updatePersonne);
router.delete('/:id', authorize('admin', 'membre'), personneController.deletePersonne);

export default router;
