import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  roomId?: string; 
  
  @IsOptional()
  @IsString()
  userId?: string;
}
