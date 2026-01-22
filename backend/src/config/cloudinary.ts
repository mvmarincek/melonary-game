import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage(
  imagePath: string,
  options: {
    folder: string;
    publicId?: string;
    tags?: string[];
  }
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: `melonary/${options.folder}`,
    public_id: options.publicId,
    tags: options.tags,
    resource_type: 'image'
  });
  
  return {
    url: result.secure_url,
    publicId: result.public_id
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
