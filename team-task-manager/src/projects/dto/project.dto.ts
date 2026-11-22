import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Q4 marketing site revamp' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AddMemberDto {
  @ApiProperty({ example: 'sara@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ProjectRole, example: ProjectRole.MEMBER })
  @IsEnum(ProjectRole)
  role: ProjectRole;
}