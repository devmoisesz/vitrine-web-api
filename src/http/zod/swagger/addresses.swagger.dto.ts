import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAddressBodySwaggerDto {
  @ApiProperty({
    example: 'Casa',
  })
  label!: string;

  @ApiPropertyOptional({
    example: '15900000',
  })
  cep?: string;

  @ApiProperty({
    example: 'SP',
  })
  state!: string;

  @ApiProperty({
    example: 'Taquaritinga',
  })
  city!: string;

  @ApiProperty({
    example: 'Centro',
  })
  neighborhood!: string;

  @ApiPropertyOptional({
    example: 'Rua Campos Sales',
  })
  street?: string;

  @ApiPropertyOptional({
    example: '123',
  })
  number?: string;

  @ApiPropertyOptional({
    example: 'Apartamento 2',
  })
  complement?: string;
}

export class UpdateAddressSwaggerDto {
  @ApiPropertyOptional({
    example: 'Casa',
  })
  label?: string;

  @ApiPropertyOptional({
    example: '15900-000',
  })
  cep?: string;

  @ApiPropertyOptional({
    example: 'SP',
  })
  state?: string;

  @ApiPropertyOptional({
    example: 'Taquaritinga',
  })
  city?: string;

  @ApiPropertyOptional({
    example: 'Centro',
  })
  neighborhood?: string;

  @ApiPropertyOptional({
    example: 'Rua Principal',
  })
  street?: string;

  @ApiPropertyOptional({
    example: '123',
  })
  number?: string;

  @ApiPropertyOptional({
    example: 'Apartamento 2',
  })
  complement?: string;
}

export class AddressResponseSwaggerDto {
  @ApiProperty({
    example: 'clx123abc456',
  })
  id!: string;

  @ApiProperty({
    example: 'Casa',
  })
  label!: string;

  @ApiPropertyOptional({
    example: '15900-000',
    nullable: true,
  })
  cep!: string | null;

  @ApiProperty({
    example: 'SP',
  })
  state!: string;

  @ApiProperty({
    example: 'Taquaritinga',
  })
  city!: string;

  @ApiProperty({
    example: 'Centro',
  })
  neighborhood!: string;

  @ApiPropertyOptional({
    example: 'Rua Principal',
    nullable: true,
  })
  street!: string | null;

  @ApiPropertyOptional({
    example: '123',
    nullable: true,
  })
  number!: string | null;

  @ApiPropertyOptional({
    example: 'Casa 2',
    nullable: true,
  })
  complement!: string | null;
}

export class UpdateAddressBodySwaggerDto {
  @ApiPropertyOptional({
    example: 'Casa',
  })
  label?: string;

  @ApiPropertyOptional({
    example: '15900000',
  })
  cep?: string;

  @ApiPropertyOptional({
    example: 'SP',
  })
  state?: string;

  @ApiPropertyOptional({
    example: 'Taquaritinga',
  })
  city?: string;

  @ApiPropertyOptional({
    example: 'Centro',
  })
  neighborhood?: string;

  @ApiPropertyOptional({
    example: 'Rua Campos Sales',
  })
  street?: string;

  @ApiPropertyOptional({
    example: '123',
  })
  number?: string;

  @ApiPropertyOptional({
    example: 'Apartamento 2',
  })
  complement?: string;
}