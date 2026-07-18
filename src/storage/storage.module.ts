import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CloudinaryStorageService } from './cloudinary/cloudinary-storage.service';
import { EnvService } from '@/env/env.service';

@Module({
  providers: [
    EnvService,
    {
      provide: StorageService,
      useClass: CloudinaryStorageService, 
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}