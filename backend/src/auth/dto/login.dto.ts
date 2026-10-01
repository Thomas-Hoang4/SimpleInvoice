import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'reviewer@101digital.io',
    description: 'User registered email address',
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email must not be empty' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User secret password',
  })
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password must not be empty' })
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password: string;
}
