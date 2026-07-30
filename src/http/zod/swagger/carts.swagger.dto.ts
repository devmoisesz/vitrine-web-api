import { ApiProperty } from '@nestjs/swagger';

export class CartResponseSwaggerDto {
  @ApiProperty({
    example: 'clx123abc',
  })
  id!: string;

  @ApiProperty({
    example: 'store-id',
  })
  storeId!: string;

  @ApiProperty({
    example: 'user-id',
  })
  userId!: string;

  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  updatedAt!: Date;
}

export class CartProductImageSwaggerDto {
  @ApiProperty({
    example:
      'https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg',
  })
  image_url!: string;
}

export class CartProductCategorySwaggerDto {
  @ApiProperty({
    example: 'Pants',
  })
  name!: string;
}

export class CartProductSubcategorySwaggerDto {
  @ApiProperty({
    example: 'Masculine',
  })
  name!: string;
}

export class CartProductDetailsSwaggerDto {
  @ApiProperty({
    example: 'Pants Black',
  })
  name!: string;

  @ApiProperty({
    example: '69.79',
  })
  price!: string;

  @ApiProperty({
    type: CartProductImageSwaggerDto,
    isArray: true,
  })
  products_images!: CartProductImageSwaggerDto[];

  @ApiProperty({
    type: CartProductCategorySwaggerDto,
  })
  category!: CartProductCategorySwaggerDto;

  @ApiProperty({
    type: CartProductSubcategorySwaggerDto,
  })
  subcategory!: CartProductSubcategorySwaggerDto;
}

export class CartProductResponseSwaggerDto {
  @ApiProperty({
    example: 'c5dd0ce8-1415-4fe5-a8c1-2a924a4819e7',
  })
  id!: string;

  @ApiProperty({
    example: '18bf7a30-5d67-48b7-b287-21fb4995016c',
  })
  cartId!: string;

  @ApiProperty({
    example: '570787f0-a1ec-4dc6-b12a-1f27b62b2152',
  })
  productId!: string;

  @ApiProperty({
    example: 5,
  })
  quantity!: number;

  @ApiProperty({
    example: 'M',
    nullable: true,
  })
  selectedSize!: string | null;

  @ApiProperty({
    example: '2026-07-24T19:36:06.570Z',
  })
  createdAt!: Date;

  @ApiProperty({
    type: CartProductDetailsSwaggerDto,
  })
  product!: CartProductDetailsSwaggerDto;
}
