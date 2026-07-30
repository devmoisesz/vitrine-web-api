import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOWED_SIZES } from '@/http/zod/schema/products';

export class RegisterProductBodySwaggerDto {
  @ApiProperty({
    example: 'Camiseta Básica',
  })
  name_product!: string;

  @ApiProperty({
    type: [String],
    example: ['camiseta', 'algodão'],
  })
  tags!: string[];

  @ApiProperty({
    example: 'Camiseta 100% algodão.',
  })
  description!: string;

  @ApiProperty({
    example: 79.9,
  })
  price!: number;

  @ApiPropertyOptional({
    enum: ALLOWED_SIZES,
    isArray: true,
    example: ['M', 'G'],
  })
  sizes?: string[];

  @ApiProperty({
    example: 20,
  })
  stock!: number;

  @ApiProperty({
    example: 'Masculino',
  })
  name_category!: string;

  @ApiProperty({
    example: 'Camisetas',
  })
  name_subcategory!: string;
}

export class EditProductBodySwaggerDto {
  @ApiPropertyOptional()
  newNameProduct?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['verão', 'algodão'],
  })
  newTags?: string[];

  @ApiPropertyOptional()
  newDescription?: string;

  @ApiPropertyOptional({
    example: 99.9,
  })
  newPrice?: number;

  @ApiPropertyOptional({
    enum: ALLOWED_SIZES,
    isArray: true,
    example: ['P', 'M'],
  })
  newSizes?: string[];

  @ApiPropertyOptional({
    example: 10,
  })
  newStock?: number;

  @ApiPropertyOptional()
  newCategory?: string;

  @ApiPropertyOptional()
  newSubcategory?: string;
}

export class ProductResponseSwaggerDto {
  @ApiProperty({
    example: 'clx123abc',
  })
  id!: string;

  @ApiProperty({
    example: 'Camisa preta',
  })
  name!: string;

  @ApiProperty({
    example: ['camisa', 'preta'],
  })
  tags!: string[];

  @ApiProperty({
    example: 'Camisa de algodão preta',
  })
  description!: string;

  @ApiProperty({
    example: 99.9,
  })
  price!: number;

  @ApiProperty({
    example: ['M', 'G'],
  })
  sizes!: string[];

  @ApiProperty({
    example: 20,
  })
  stock!: number;

  @ApiProperty({
    example: 'ATIVO',
  })
  status!: string;

  @ApiProperty({
    example: 'category-id',
  })
  categoryId!: string;

  @ApiProperty({
    example: 'subcategory-id',
  })
  subcategoryId!: string;

  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  updatedAt!: Date;
}

export class GetProductSwaggerDto {
  @ApiProperty({
    example: {
      id: '570787f0-a1ec-4dc6-b12a-1f27b62b2152',
      name: 'Pants Black',
      price: '69.79',
      description: 'Calça preta masculina',
      stock: 10,
      status: 'ATIVO',
    },
  })
  product!: object;

  @ApiProperty({
    example: [
      {
        id: 'image-id',
        image_url: 'https://cdn.example.com/product/image.jpg',
      },
    ],
    type: [Object],
  })
  images!: object[];
}

export class UpdateProductStatusSwaggerDto {
  @ApiProperty({
    enum: ['ATIVO', 'INATIVO'],
    example: 'ATIVO',
    description: 'New product status.',
  })
  status!: 'ATIVO' | 'INATIVO';
}

export class AddProductToCartBodySwaggerDto {
  @ApiProperty({
    example: 2,
    description: 'Quantidade de produtos adicionados ao carrinho.',
  })
  quantity!: number;

  @ApiPropertyOptional({
    enum: ALLOWED_SIZES,
    example: 'M',
    description: 'Tamanho selecionado do produto.',
  })
  size?: string;
}

export class UpdateCartItemBodySwaggerDto {
  @ApiPropertyOptional({
    example: 3,
  })
  quantity?: number;

  @ApiPropertyOptional({
    enum: ALLOWED_SIZES,
    example: 'G',
  })
  size?: string;
}
