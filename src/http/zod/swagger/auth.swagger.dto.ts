import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseSwaggerDto {
  @ApiProperty({
    example: 'Logout realizado com sucesso',
  })
  message!: string;
}