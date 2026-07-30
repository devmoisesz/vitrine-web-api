import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountBodySwaggerDto {
  @ApiProperty({
    description: 'User full name.',
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User password.',
    example: 'StrongPassword123',
    minLength: 6,
  })
  password!: string;
}

export class GoogleAuthenticateSwaggerDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIs...',
    description: 'Google OAuth ID Token',
  })
  id_token!: string;
}

export class GetProfileResponseSwaggerDto {
  @ApiProperty({
    example: 'Moisés',
  })
  user_name!: string;

  @ApiProperty({
    example: 'moises@email.com',
  })
  user_email!: string;

  @ApiProperty({
    example: 'LOCAL',
  })
  provider!: string;

  @ApiProperty({
    example: 'Cliente',
  })
  user_role!: string;

  @ApiPropertyOptional({
    example: 'Minha Loja',
  })
  store_name?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'User address.',
  })
  user_address?: object | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Store address.',
  })
  store_address?: object;
}

export class AuthenticateBodySwaggerDto {
  @ApiProperty({
    description: 'User email address.',
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User password.',
    example: 'StrongPassword123',
    minLength: 6,
  })
  password!: string;
}

export class AuthenticateResponseSwaggerDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token.',
  })
  access_token!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token.',
  })
  refresh_token!: string;
}

export class RefreshTokenResponseSwaggerDto {
  @ApiProperty({
    description: 'New JWT access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
  })
  access_token!: string;

  @ApiProperty({
    description: 'New JWT refresh token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
  })
  refresh_token!: string;
}

export class ChangePasswordBodySwaggerDto {
  @ApiProperty({
    description: 'Current user password.',
    example: 'CurrentPassword123',
    minLength: 6,
  })
  currentPassword!: string;

  @ApiProperty({
    description: 'New user password.',
    example: 'NewPassword123',
    minLength: 6,
  })
  newPassword!: string;
}

export class EditUserDataBodySwaggerDto {
  @ApiPropertyOptional({
    description: 'User full name.',
    example: 'John Doe',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'User email address.',
    example: 'john@example.com',
  })
  email?: string;
}