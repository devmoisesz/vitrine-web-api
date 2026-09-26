import { ApiProperty } from '@nestjs/swagger';
import type {
  PublicHomeProductDto,
  PublicHomeStoreDto,
  PublicProductImageDto,
  PublicStoreDto,
} from '@/use-cases/services/stores/dtos/public-store.dto';

export class PublicStoreResponseSwaggerDto implements PublicStoreDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: String, nullable: true }) logo_image_url!: string | null;
  @ApiProperty({ type: String, nullable: true }) bannerUrl!: string | null;
}

export class PublicProductImageSwaggerDto implements PublicProductImageDto {
  @ApiProperty() id!: string;
  @ApiProperty() image_url!: string;
  @ApiProperty() is_main!: boolean;
}

export class PublicHomeProductSwaggerDto implements PublicHomeProductDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ example: '69.79' }) price!: string;
  @ApiProperty({ type: [String] }) sizes!: string[];
  @ApiProperty() stock!: number;
  @ApiProperty({ enum: ['ATIVO', 'INATIVO'] }) status!: 'ATIVO' | 'INATIVO';
  @ApiProperty() storeId!: string;
  @ApiProperty() categoryId!: string;
  @ApiProperty() subcategoryId!: string;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
  @ApiProperty({ type: [PublicProductImageSwaggerDto] })
  products_images!: PublicProductImageSwaggerDto[];
}

export class PublicHomeStoreResponseSwaggerDto
  extends PublicStoreResponseSwaggerDto
  implements PublicHomeStoreDto
{
  @ApiProperty({ type: [PublicHomeProductSwaggerDto] })
  products!: PublicHomeProductSwaggerDto[];
}
