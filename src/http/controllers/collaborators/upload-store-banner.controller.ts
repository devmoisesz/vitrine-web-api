import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UploadStoreBannerService } from '@/use-cases/services/stores/upload-store-banner.service';
import {
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('/stores/:slug/banner')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiBearerAuth()
@ApiTags('Upload Store Banner')
export class UploadStoreBannerController {
  constructor(private uploadStoreBannerService: UploadStoreBannerService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload store banner',
    description: 'Uploads a banner image for a store.',
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
            'Store banner image (png, jpg, jpeg or webp). Maximum 5MB.',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Store not found.',
  })
  @ApiConflictResponse({
    description: 'Store already has a banner.',
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

    @Param('slug') slug: string,
  ) {
    return await this.uploadStoreBannerService.execute(slug, file);
  }
}
