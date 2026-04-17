import path from 'path';
import multer from 'multer';
import AppError from '../utils/AppError';

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

/** Fotos de iPhone em alta resolução podem ultrapassar 5 MB. */
const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    let mime = (file.mimetype || '').toLowerCase();
    if (mime === 'image/jpg') mime = 'image/jpeg';

    const ext = path.extname(file.originalname || '').toLowerCase();
    const mimeFromExt = EXT_TO_MIME[ext];

    if (ALLOWED_MIMES.has(mime)) {
      Object.assign(file, { mimetype: mime });
      return cb(null, true);
    }

    if (mime === '' || mime === 'application/octet-stream') {
      if (mimeFromExt) {
        Object.assign(file, { mimetype: mimeFromExt });
        return cb(null, true);
      }
    }

    return cb(
      new AppError('Formato de imagem não suportado. Use JPEG, PNG, WebP ou HEIC.', 400),
    );
  },
});

export default upload;
