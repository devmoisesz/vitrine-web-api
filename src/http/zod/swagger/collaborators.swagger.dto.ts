import { ApiProperty } from '@nestjs/swagger';

export class RegisterCollaboratorBodySwaggerDto {
  @ApiProperty({
    example: 'João Silva',
  })
  name!: string;

  @ApiProperty({
    example: 'joao@example.com',
  })
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123',
  })
  password!: string;

  @ApiProperty({
    enum: ['Proprietário', 'Funcionário'],
    example: 'Funcionário',
  })
  role!: string;
}