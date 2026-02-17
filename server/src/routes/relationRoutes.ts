import { Router } from 'express';
import { body } from 'express-validator';
import * as relationController from '../controllers/relationController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Toutes les routes sont protégées par authentification
router.use(protect);

// Validation des données
const validateRelation = [
  body('type').isIn(['parent', 'conjoint', 'enfant', 'frere_soeur', 'mariage', 'divorce', 'fiançailles'])
    .withMessage('Type de relation invalide'),
  body('personne1').isMongoId().withMessage('ID de la première personne invalide'),
  body('personne2').isMongoId().withMessage('ID de la deuxième personne invalide'),
  body('dateDebut').optional().isISO8601().withMessage('Format de date invalide (format ISO)'),
  body('dateFin').optional().isISO8601().withMessage('Format de date invalide (format ISO)'),
  body('details').optional().isString().withMessage('Les détails doivent être une chaîne de caractères')
];

// Routes pour les relations
router.get('/', relationController.getRelations);
router.get('/personne/:personneId', relationController.getRelationsByPersonne);
router.get('/famille/:personneId', relationController.getFamille);

// Routes d'écriture (membres et admins seulement)
router.post('/', authorize('admin', 'membre'), [...validateRelation], relationController.createRelation);
router.put('/:id', authorize('admin', 'membre'), [...validateRelation], relationController.updateRelation);
router.delete('/:id', authorize('admin', 'membre'), relationController.deleteRelation);

export default router;
