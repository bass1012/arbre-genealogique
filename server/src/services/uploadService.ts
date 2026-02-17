import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string = 'arbre-genealogique/photos'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export const uploadBase64Image = async (
  base64String: string,
  folder: string = 'arbre-genealogique/photos'
): Promise<UploadResult> => {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    throw new Error(`Erreur lors de l'upload de l'image: ${error}`);
  }
};
