import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  url: string;
  publicId: string;
}

// Répertoire de stockage des uploads
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

// Créer le répertoire uploads s'il n'existe pas
const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string = 'photos'
): Promise<UploadResult> => {
  ensureUploadsDir();
  
  const filename = `${uuidv4()}.webp`;
  const subDir = path.join(UPLOADS_DIR, folder);
  
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }
  
  const filepath = path.join(subDir, filename);
  
  // Redimensionner et optimiser l'image avec sharp
  await sharp(fileBuffer)
    .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);
  
  const publicId = `${folder}/${filename}`;
  const url = `/uploads/${publicId}`;
  
  return { url, publicId };
};

export const deleteImage = async (publicId: string): Promise<void> => {
  const filepath = path.join(UPLOADS_DIR, publicId);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

export const uploadBase64Image = async (
  base64String: string,
  folder: string = 'photos'
): Promise<UploadResult> => {
  try {
    ensureUploadsDir();
    
    // Extraire les données base64
    const matches = base64String.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Format base64 invalide');
    }
    
    const imageBuffer = Buffer.from(matches[2], 'base64');
    const filename = `${uuidv4()}.webp`;
    const subDir = path.join(UPLOADS_DIR, folder);
    
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    
    const filepath = path.join(subDir, filename);
    
    // Redimensionner et optimiser l'image
    await sharp(imageBuffer)
      .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);
    
    const publicId = `${folder}/${filename}`;
    const url = `/uploads/${publicId}`;
    
    return { url, publicId };
  } catch (error) {
    throw new Error(`Erreur lors de l'upload de l'image: ${error}`);
  }
};
