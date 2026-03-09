import { Request, Response } from 'express';
import { uploadImage } from '../lib/cloudinary';
import logger from '../lib/logger';

export const handleUploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { url, publicId } = await uploadImage(req.file.buffer, 'games');

    logger.info({ publicId }, 'Image uploaded');
    res.status(201).json({ url, publicId });
  } catch (err: any) {
    logger.error({ err }, 'Upload failed');
    res.status(500).json({ error: err.message ?? 'Upload failed' });
  }
};
