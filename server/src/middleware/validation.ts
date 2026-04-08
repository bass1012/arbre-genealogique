import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validatePersonne = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
  body('dateNaissance').custom((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}/.test(value)) throw new Error('Date de naissance invalide');
    return true;
  }),
  // dateDeces - pas de validation requise, accepte null
  body('dateDeces').optional(),
  body('genre').custom((value) => {
    if (!value) return true;
    if (!['homme', 'femme', 'autre'].includes(value)) throw new Error('Genre invalide');
    return true;
  }),
  body('email').custom((value) => {
    if (!value) return true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Email invalide');
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
