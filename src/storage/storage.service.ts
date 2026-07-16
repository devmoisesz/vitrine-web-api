export abstract class StorageService {
  abstract upload(file: Express.Multer.File, folder?: string): Promise<{ url: string; id: string }>;
  abstract delete(id: string): Promise<void>;
}