import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ChangeProductImageService } from '@/use-cases/services/products/change-product-image.service';
import {
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/stores/:slug/productimages/:productId/:imageId')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class ChangeProductImageController {
  constructor(private changeProductImageService: ChangeProductImageService) {}

  @Patch()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, //2mb
          }),
          new FileTypeValidator({
            fileType: '.(png|jpg|jpeg|webp)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,

    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return await this.changeProductImageService.execute(
      productId,
      imageId,
      file,
    );
  }
}
