import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UploadStoreLogoService } from '@/use-cases/services/stores/upload-store-logo.service';
import {
    Controller,
    FileTypeValidator,
    HttpCode,
    MaxFileSizeValidator,
    Param, ParseFilePipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/stores/:slug/logo')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class UploadStoreLogoController {
  constructor(
    private uploadStoreLogoService: UploadStoreLogoService,
  ) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file"))
  async handle(
    @UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({
                    maxSize: 1024 * 1024 * 2, //2mb
                }),
                new FileTypeValidator({
                    fileType: ".(png|jpg|jpeg|webp)"
                })
            ]
        })
    )
    file: Express.Multer.File,
    
    @Param('slug') slug: string,
  ) {
    return await this.uploadStoreLogoService.execute(slug, file);
  }
}
