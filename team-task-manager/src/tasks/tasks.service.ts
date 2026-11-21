import 'multer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private storage: StorageService,
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

  async addAttachment(
    projectId: string,
    taskId: string,
    file: Express.Multer.File,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!task) throw new NotFoundException('تسک در این پروژه پیدا نشد');

    const { key } = await this.storage.uploadFile(file, `tasks/${taskId}`);

    return this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        fileKey: key,
        mimeType: file.mimetype,
        size: file.size,
        taskId,
      },
    });
  }

  async getAttachmentDownloadUrl(
    projectId: string,
    taskId: string,
    attachmentId: string,
  ) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, taskId, task: { projectId } },
    });
    if (!attachment) throw new NotFoundException('فایل پیوست پیدا نشد');

    const downloadUrl = await this.storage.getDownloadUrl(attachment.fileKey);
    return {
      id: attachment.id,
      fileName: attachment.fileName,
      downloadUrl,
      expiresInSeconds: 900,
    };
  }

  async removeAttachment(
    projectId: string,
    taskId: string,
    attachmentId: string,
  ) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, taskId, task: { projectId } },
    });
    if (!attachment) throw new NotFoundException('فایل پیوست پیدا نشد');

    await this.storage.deleteFile(attachment.fileKey);
    return this.prisma.attachment.delete({ where: { id: attachmentId } });
  }
}