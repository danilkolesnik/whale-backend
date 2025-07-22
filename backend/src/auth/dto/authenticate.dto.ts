import { IsNotEmpty, IsString } from 'class-validator';

export class AuthenticateDto {
  @IsNotEmpty()
  @IsString()
  initData: string;
} 