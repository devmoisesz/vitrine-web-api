import { StorageService, UploadParams } from "@/storage/storage.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

export class StorageInMemory implements StorageService {
    public items: Map<string, { url: string; public_id: string }> = new Map();

  async upload({body, folder = 'root'}: UploadParams): Promise<{ url: string; public_id: string }> {
    if (!body) {
      throw new BadRequestException('O buffer do arquivo está vazio ou inválido.');
    }

    const public_id = `mock-folder/${folder}/file-${Math.random().toString(36).substring(7)}`;
    const url = `https://res.cloudinary.com/mock-cloud/image/upload/${public_id}.jpg`;

    const fileData = { 
      url, 
      id: public_id,
      public_id
    };
    this.items.set(public_id, fileData);

    return fileData;
  }

  async getFile(id: string) {
    const file = this.items.get(id);

    if (!file) {
      throw new NotFoundException('Imagem não encontrada.');
    }

    return {
      url: file.url,
      format: 'jpg',
      width: 800,
      height: 600,
    };
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}
