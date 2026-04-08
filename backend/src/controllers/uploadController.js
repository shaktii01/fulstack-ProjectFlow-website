import { createRequire } from 'module';
import asyncHandler from 'express-async-handler';
import multer, { memoryStorage } from 'multer';

// imagekit uses CJS internals incompatible with Node 24 ESM strict loader
const require = createRequire(import.meta.url);
const ImageKit = require('imagekit');

// Store file in memory (no disk I/O) — multer v2 uses named memoryStorage export
export const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Lazy-init: create the instance inside the handler so dotenv has already loaded env vars
let _imagekit = null;
const getImagekit = () => {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return _imagekit;
};

// @desc    Upload image to ImageKit (server-side, no CORS)
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file provided');
  }

  const imagekit = getImagekit();
  const fileName = `profile_${req.user._id}_${Date.now()}`;

  const result = await imagekit.upload({
    file: req.file.buffer,        // Buffer from multer memoryStorage
    fileName,
    folder: '/projectflow/profiles',
    useUniqueFileName: true,
  });

  res.json({ url: result.url, fileId: result.fileId });
});

export { uploadImage };
