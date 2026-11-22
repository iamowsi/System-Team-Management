import 'multer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { ProjectRoles } from '../auth/decorators/project-roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectRolesGuard } from '../auth/guards/project-roles.guard';
import { CreateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks & Attachments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a task (sends async email if assigned)' })
  @ProjectRoles(ProjectRole.MANAGER, ProjectRole.MEMBER)
  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(projectId, dto);
  }

  @ApiOperation({ summary: 'List all tasks in a project' })
  @ProjectRoles(ProjectRole.MANAGER, ProjectRole.MEMBER)
  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.tasksService.findAll(projectId);
  }

  @ApiOperation({ summary: 'Update task status' })
  @ProjectRoles(ProjectRole.MANAGER, ProjectRole.MEMBER)
  @Patch(':taskId/status')
  updateStatus(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(projectId, taskId, dto);
  }

  @ApiOperation({ summary: 'Delete a task (Project Manager only)' })
  @ProjectRoles(ProjectRole.MANAGER)
  @Delete(':taskId')
  remove(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.remove(projectId, taskId);
  }

  @ApiOperation({ summary: 'Upload an attachment to S3 (max 5MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ProjectRoles(ProjectRole.MANAGER, ProjectRole.MEMBER)
  @Post(':taskId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadAttachment(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('هیچ فایلی ارسال نشده است');
    return this.tasksService.addAttachment(projectId, taskId, file);
  }

  @ApiOperation({ summary: 'Get temporary Presigned S3 download URL' })
  @ProjectRoles(ProjectRole.MANAGER, ProjectRole.MEMBER)
  @Get(':taskId/attachments/:attachmentId/download')
  getDownloadUrl(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.tasksService.getAttachmentDownloadUrl(
      projectId,
      taskId,
      attachmentId,
    );
  }

  @ApiOperation({ summary: 'Delete attachment from S3 and DB (Manager only)' })
  @ProjectRoles(ProjectRole.MANAGER)
  @Delete(':taskId/attachments/:attachmentId')
  removeAttachment(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.tasksService.removeAttachment(projectId, taskId, attachmentId);
  }
}