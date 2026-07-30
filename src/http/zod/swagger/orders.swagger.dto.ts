import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseSwaggerDto {
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
    example: 199.90,
  })
  total!: number;


  @ApiProperty({
    example: 'PENDENTE',
  })
  status!: string;


  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  createdAt!: Date;


  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  updatedAt!: Date;
}

export class OrderProductResponseSwaggerDto {
  @ApiProperty({
    example: 'clx123abc',
  })
  id!: string;


  @ApiProperty({
    example: 'product-id',
  })
  productId!: string;


  @ApiProperty({
    example: 'Camisa preta',
  })
  productName!: string;


  @ApiProperty({
    example: 2,
  })
  quantity!: number;


  @ApiProperty({
    example: 99.90,
  })
  price!: number;


  @ApiProperty({
    example: 'M',
    nullable: true,
  })
  selectedSize!: string | null;


  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
  })
  createdAt!: Date;
}