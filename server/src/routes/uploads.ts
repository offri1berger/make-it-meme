import { Router } from 'express';
import multer from 'multer';
import { handleUploadImage } from '../controllers/uploadImageController';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, png, webp, gif) are allowed'));
    }
  },
});

router.post('/', upload.single('image'), handleUploadImage);

export default router;
