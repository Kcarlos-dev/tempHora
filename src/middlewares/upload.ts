import multer from 'multer';
import AppError from '../utils/AppError';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new AppError('Formato de imagem não suportado. Use JPEG, PNG, WebP ou HEIC.', 400));
    }
    cb(null, true);
  },
});

export default upload;
