import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterStoreBodySwaggerDto {
  @ApiProperty({
    description: 'Store name.',
    example: 'Loja Exemplo',
  })
  store_name!: string;

  @ApiPropertyOptional({
    description: 'Store email address.',
    example: 'contato@loja.com',
  })
  store_email?: string;

  @ApiProperty({
    description: 'Owner email address.',
    example: 'owner@example.com',
  })
  owner_email!: string;

  @ApiProperty({
    description: 'Store WhatsApp number including area code.',
    example: '16999998888',
  })
  whatsapp!: string;
}

export class StoreResponseSwaggerDto {
  @ApiProperty({
    example: 'clx123abc456',
  })
  id!: string;

  @ApiProperty({
    example: 'Minha Loja',
  })
  name!: string;

  @ApiProperty({
    example: 'minha-loja',
  })
  slug!: string;

  @ApiPropertyOptional({
    example: 'contato@loja.com',
    nullable: true,
  })
  email!: string | null;

  @ApiProperty({
    example: '15999999999',
  })
  whatsapp!: string;

  @ApiPropertyOptional({
    example: 'https://imagem.com/logo.png',
    nullable: true,
  })
  logo_image_url!: string | null;
}

export class EditStoreDataBodySwaggerDto {
  @ApiPropertyOptional({
    example: 'Nova Loja',
  })
  newName?: string;

  @ApiPropertyOptional({
    example: 'novoemail@loja.com',
  })
  newEmail?: string;

  @ApiPropertyOptional({
    example: 'Loja especializada em roupas.',
  })
  newDescription?: string;

  @ApiPropertyOptional({
    enum: ['PIX', 'DINHEIRO', 'CARTAO_ENTREGA', 'CARTAO_ONLINE'],
    isArray: true,
    example: ['PIX', 'DINHEIRO'],
  })
  payment_methods?: string[];

  @ApiPropertyOptional({
    enum: [
      'RETIRADA_LOJA',
      'ENTREGA_PROPRIA',
      'CORREIOS',
      'MOTOBOY',
    ],
    isArray: true,
    example: ['RETIRADA_LOJA'],
  })
  delivery_methods?: string[];
}