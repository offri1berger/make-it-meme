import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> => {
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File too large (${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB). Max allowed: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(fileBuffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
