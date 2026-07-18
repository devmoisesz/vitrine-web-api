import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { StorageService, UploadParams } from '../storage.service';
import { EnvService } from '@/env/env.service';

@Injectable()
export class CloudinaryStorageService implements StorageService {
  constructor(env: EnvService) {
    cloudinary.config({
      cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
      api_key: env.get('CLOUDINARY_API_KEY'),
      api_secret: env.get('CLOUDINARY_API_SECRET'),
    });
  }

  async upload({body, fileName, folder = 'vitrine-web'}: UploadParams): Promise<{ url: string; public_id: string }> {
    if (!body) {
      throw new BadRequestException('O buffer do arquivo está vazio ou inválido.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image', 
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], 
          public_id: fileName ? fileName.split('.')[0] : undefined
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new InternalServerErrorException(
                'Falha ao enviar a imagem para o storage.',
              ),
            );
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      streamifier.createReadStream(body).pipe(uploadStream);
    });
  }

  /**
   * Busca os metadados de uma imagem salva no Cloudinary pelo seu ID público (ex: "vitrine-web/foto123")
   */
  async getFile(id: string): Promise<{ url: string; format: string; width: number; height: number }> {
    try {
      const result = await cloudinary.api.resource(id, {
        resource_type: 'image',
      });

      return {
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      if (error) {
        throw new NotFoundException('Imagem não encontrada no storage.');
      }

      throw new InternalServerErrorException(
        'Falha ao buscar informações da imagem no storage.',
      );
    }
  }

  async delete(id: string): Promise<void> {
    const result = await cloudinary.uploader.destroy(id, {
      resource_type: 'image',
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new InternalServerErrorException(
        'Falha ao remover a imagem do storage.',
      );
    }
  }
}