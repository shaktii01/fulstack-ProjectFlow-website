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
