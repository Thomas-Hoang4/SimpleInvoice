import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'd3b07384-d113-494b-9c8e-bf3f8e438e8e' })
  id: string;

  @ApiProperty({ example: 'reviewer@simpleinvoice.dev' })
  email: string;

  @ApiProperty({ example: 'Reviewer User' })
  fullname: string;

  @ApiProperty({ example: '2026-10-02T00:00:00.000Z' })
  createdAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT bearer access token',
  })
  accessToken: string;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;
}
