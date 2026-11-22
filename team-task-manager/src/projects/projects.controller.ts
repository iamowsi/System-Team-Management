import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { ProjectRoles } from '../auth/decorators/project-roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectRolesGuard } from '../auth/guards/project-roles.guard';
import { AddMemberDto, CreateProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects')
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.projectsService.findAllForUser(
      req.user.userId,
      req.user.systemRole,
    );
  }

  @ProjectRoles(ProjectRole.MANAGER, ProjectRole.MEMBER)
  @Get(':projectId')
  findOne(@Param('projectId') projectId: string) {
    return this.projectsService.findOne(projectId);
  }

  @ProjectRoles(ProjectRole.MANAGER)
  @Post(':projectId/members')
  addMember(
    @Param('projectId') projectId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.projectsService.addMember(projectId, dto);
  }

  @ProjectRoles(ProjectRole.MANAGER)
  @Delete(':projectId')
  remove(@Param('projectId') projectId: string) {
    return this.projectsService.remove(projectId);
  }
}