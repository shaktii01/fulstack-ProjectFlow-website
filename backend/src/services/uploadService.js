import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ImageKit = require('imagekit');

let imagekitInstance = null;

const getImagekit = () => {
  if (!imagekitInstance) {
    imagekitInstance = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  return imagekitInstance;
};

export const uploadProfileImage = async ({ userId, fileBuffer }) => {
  const imagekit = getImagekit();
  const fileName = `profile_${userId}_${Date.now()}`;

  return imagekit.upload({
    file: fileBuffer,
    fileName,
    folder: '/projectflow/profiles',
    useUniqueFileName: true,
  });
};

export const uploadMedia = async ({ userId, fileBuffer, originalName }) => {
  const imagekit = getImagekit();
  const timestamp = Date.now();
  // Sanitize originalName or just use it as part of the new name
  const sanitizedName = originalName ? originalName.replace(/[^a-zA-Z0-9.-]/g, '_') : 'file';
  const fileName = `media_${userId}_${timestamp}_${sanitizedName}`;

  return imagekit.upload({
    file: fileBuffer,
    fileName,
    folder: '/projectflow/media',
    useUniqueFileName: true,
  });
};
