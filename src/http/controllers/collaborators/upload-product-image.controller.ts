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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('/stores/:slug/productimages/:productId')
@RequireRoles('FUNCIONARIO', 'PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Upload Image Product')
export class UploadProductImageController {
  constructor(private uploadProductImageService: UploadProductImagesService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload product image',
    description:
      'Uploads an image for a product. The first uploaded image becomes the main image automatically.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Product image (png, jpg, jpeg or webp). Maximum size: 5MB.',
        },
        is_main: {
          type: 'boolean',
          example: true,
          description:
            'Defines whether this image should become the main product image.',
        },
      },
      required: ['file'],
    },
  })
  @ApiConflictResponse({
    description: 'Store not found for this product.',
  })
  @ApiBadRequestResponse({
    description: 'Product already has the maximum number of images.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  async handle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5, //Atualizado para 5Mb
          }),
          new FileTypeValidator({
            fileType: '.(png|jpg|jpeg|webp)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,

    @Param('productId') productId: string,
    @Param('slug') slug: string,
    @Body('is_main', new ParseBoolPipe({ optional: true })) IsMain?: boolean,
  ) {
    return await this.uploadProductImageService.execute(
      slug,
      productId,
      file,
      IsMain,
    );
  }
}
