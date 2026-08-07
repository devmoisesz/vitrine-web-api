import { RequireRoles } from '@/auth/authorization/roles.decorator';
import { StoreAccessGuard } from '@/auth/authorization/store-access.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ChangeStoreBannerService } from '@/use-cases/services/stores/change-store-banner.service';
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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@Controller('/stores/:slug/banner/change')
@RequireRoles('PROPRIETARIO')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@ApiTags('Change Store Logo')
@ApiBearerAuth()
export class ChangeStoreBannerController {
  constructor(private changeStoreBannerService: ChangeStoreBannerService) {}

  @Patch()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Change store banner',
    description:
      'Replaces the current store banner with a new image.',
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
            'Store banner image. Allowed formats: png, jpg, jpeg, webp. Maximum size: 5MB.',
        },
      },
    },
  })

  @ApiUnauthorizedResponse({
    description:
      'Invalid authentication credentials.',
  })

  @ApiNotFoundResponse({
    description:
      'Store or current banner not found.',
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
    return await this.changeStoreBannerService.execute(slug, file);
  }
}
