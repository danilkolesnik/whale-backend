import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthenticateDto {
  @ApiProperty({
    description: 'Telegram user ID',
    example: '123456789'
  })
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;
} 