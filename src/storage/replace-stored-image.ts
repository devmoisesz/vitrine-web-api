import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { StorageService, UploadParams } from './storage.service';

const logger = new Logger('ReplaceStoredImage');

async function cleanup(storage: StorageService, publicId: string) {
  try {
    await storage.delete(publicId);
  } catch {
    // The committed image must remain usable even when storage cleanup fails.
    logger.warn(
      `Image cleanup failed; retry deletion for storage id: ${publicId}`,
    );
  }
}

export async function replaceStoredImage<T>(
  storage: StorageService,
  previousPublicId: string,
  upload: UploadParams,
  persist: (image: { url: string; public_id: string }) => Promise<T>,
): Promise<T> {
  const image = await storage.upload({
    ...upload,
    // Cloudinary uses fileName as its public id. Never overwrite the old file,
    // including when the replacement has exactly the same original name.
    fileName: `${randomUUID()}-${upload.fileName}`,
  });

  let result: T;
  try {
    result = await persist(image);
  } catch (error) {
    await cleanup(storage, image.public_id);
    throw error;
  }

  await cleanup(storage, previousPublicId);
  return result;
}
