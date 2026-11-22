import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design Database Schema' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Setup Prisma models and relations' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '8b59db1f-8e7b-4c28-a41e-09c3c7746b24',
    description: 'User UUID to assign the task (triggers background email)',
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: TaskStatus, example: TaskStatus.IN_PROGRESS })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}