import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRole, SystemRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto, CreateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        members: {
          create: {
            userId,
            role: ProjectRole.MANAGER,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findAllForUser(userId: string, systemRole: string) {
    if (systemRole === SystemRole.ADMIN) {
      return this.prisma.project.findMany({ include: { members: true } });
    }

    return this.prisma.project.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          select: { userId: true, role: true },
        },
      },
    });
  }

  async findOne(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        tasks: true,
      },
    });
    if (!project) throw new NotFoundException('پروژه پیدا نشد');
    return project;
  }

  async addMember(projectId: string, dto: AddMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('کاربری با این ایمیل پیدا نشد');
    }

    const exists = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (exists) {
      throw new ConflictException('این کاربر قبلاً عضو پروژه است');
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: dto.role ?? ProjectRole.MEMBER,
      },
    });
  }

  async remove(projectId: string) {
    return this.prisma.project.delete({ where: { id: projectId } });
  }
}