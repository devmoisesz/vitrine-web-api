export interface UploadParams {
  body: Buffer;
  fileName: string;
  contentType?: string;
  folder?: string;
}

export abstract class StorageService {
  abstract upload(params: UploadParams): Promise<{ url: string; public_id: string }>;
  abstract getFile(id: string): Promise<{ url: string; format: string; width: number; height: number }>
  abstract delete(id: string): Promise<void>;
}