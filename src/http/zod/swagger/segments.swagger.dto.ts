import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SegmentBodySwaggerDto {
  @ApiProperty({ maxLength: 100 }) name!: string;
  @ApiPropertyOptional({ maxLength: 100, description: 'Slug único. Gerado no cadastro se omitido; preservado na edição se omitido.' }) slug?: string;
}

export class SegmentResponseSwaggerDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}
