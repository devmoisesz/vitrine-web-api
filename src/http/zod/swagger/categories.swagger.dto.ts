import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterCategoryBodySwaggerDto {
  @ApiProperty({
    example: 'Masculino',
  })
  name!: string;
}

export class CategoryResponseSwaggerDto {
  @ApiProperty({
    example: 'clx123abc',
  })
  id!: string;


  @ApiProperty({
    example: 'Camisas',
  })
  name!: string;


  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  createdAt!: Date;


  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  updatedAt!: Date;
}

export class SubcategoryResponseSwaggerDto {
  @ApiProperty({
    example: 'clx123abc456',
  })
  id!: string;

  @ApiProperty({
    example: 'Camisetas',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'clx987xyz654',
    nullable: true,
  })
  categoryId!: string | null;
}
