"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBase64Image = exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadImage = async (fileBuffer, folder = 'arbre-genealogique/photos') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder,
            resource_type: 'image',
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result) {
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadImage = uploadImage;
const deleteImage = async (publicId) => {
    await cloudinary_1.default.uploader.destroy(publicId);
};
exports.deleteImage = deleteImage;
const uploadBase64Image = async (base64String, folder = 'arbre-genealogique/photos') => {
    try {
        const result = await cloudinary_1.default.uploader.upload(base64String, {
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
    }
    catch (error) {
        throw new Error(`Erreur lors de l'upload de l'image: ${error}`);
    }
};
exports.uploadBase64Image = uploadBase64Image;
