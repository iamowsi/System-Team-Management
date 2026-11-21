import { ProjectRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(ProjectRole)
  @IsOptional()
  role?: ProjectRole;
}