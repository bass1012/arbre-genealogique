import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validatePersonne = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
  body('dateNaissance').optional().isISO8601().withMessage('Date de naissance invalide'),
  body('dateDeces').optional().isISO8601().withMessage('Date de décès invalide'),
  body('genre').optional().isIn(['homme', 'femme', 'autre']).withMessage('Genre invalide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  
  body('dateDeces').custom((dateDeces, { req }) => {
    if (dateDeces && req.body.dateNaissance) {
      const naissance = new Date(req.body.dateNaissance);
      const deces = new Date(dateDeces);
      if (deces <= naissance) {
        throw new Error('La date de décès doit être postérieure à la date de naissance');
      }
    }
    return true;
  }),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateDocument = [
  body('type').isIn([
    'acte_naissance',
    'acte_deces',
    'acte_mariage',
    'photo',
    'diplome',
    'contrat_travail',
    'document_identite',
    'certificat',
    'autre'
  ]).withMessage('Type de document invalide'),
  body('titre').trim().notEmpty().withMessage('Le titre est requis'),
  body('date').optional().isISO8601().withMessage('Date invalide'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
