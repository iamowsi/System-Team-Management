import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(projectId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId,
        assigneeId: dto.assigneeId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { name: true } },
      },
    });

    // اگر تسک به کاربری محول شده، ارسال ایمیل را در صف پس‌زمینه قرار بده
    if (task.assignee) {
      await this.mailService.sendTaskAssignedEmail(
        task.assignee.email,
        task.title,
        task.project.name,
      );
    }

    return task;
  }

  async findAll(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    projectId: string,
    taskId: string,
    dto: UpdateTaskStatusDto,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!task) throw new NotFoundException('تسک در این پروژه پیدا نشد');

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: dto.status },
    });
  }

  async remove(projectId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!task) throw new NotFoundException('تسک در این پروژه پیدا نشد');

    return this.prisma.task.delete({ where: { id: taskId } });
  }
}