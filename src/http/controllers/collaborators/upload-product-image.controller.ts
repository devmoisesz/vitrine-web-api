import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UploadProductImagesService } from '@/use-cases/services/products/upload-product-image.service';
import {
    Body,
    Controller,
    FileTypeValidator,
    HttpCode,
    MaxFileSizeValidator,
    Param,
    ParseBoolPipe,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/stores/:slug/productimages/:productId')
@RequireRoles('FUNCIONARIO' ,'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class UploadProductImageController {
  constructor(
    private uploadProductImageService: UploadProductImagesService,
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
    
    @Param('productId') productId: string,
    @Param('slug') slug: string,
    @Body('is_main', new ParseBoolPipe({ optional: true })) IsMain?: boolean 
  ) {

    return await this.uploadProductImageService.execute(slug, productId, file, IsMain);
  }
}
