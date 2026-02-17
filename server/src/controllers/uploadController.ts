import { Request, Response } from 'express';
import { uploadImage, uploadBase64Image, deleteImage } from '../services/uploadService';

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Aucun fichier fourni' });
      return;
    }

    const result = await uploadImage(req.file.buffer, 'arbre-genealogique/photos');
    
    res.status(200).json({
      message: 'Photo uploadée avec succès',
      url: result.url,
      publicId: result.publicId
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upload de la photo',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const uploadPhotoBase64 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      res.status(400).json({ message: 'Image base64 requise' });
      return;
    }

    const result = await uploadBase64Image(base64Image, 'arbre-genealogique/photos');
    
    res.status(200).json({
      message: 'Photo uploadée avec succès',
      url: result.url,
      publicId: result.publicId
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo base64:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upload de la photo',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const removePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      res.status(400).json({ message: 'Public ID requis' });
      return;
    }

    await deleteImage(publicId);
    
    res.status(200).json({
      message: 'Photo supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de la photo',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
