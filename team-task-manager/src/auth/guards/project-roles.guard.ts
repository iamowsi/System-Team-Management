import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole, SystemRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PROJECT_ROLES_KEY } from '../decorators/project-roles.decorator';

@Injectable()
export class ProjectRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(
      PROJECT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // اگر نقشی روی مسیر تعیین نشده باشد، نیازی به چک کردن نیست
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // لایه اول: ادمین کل سیستم به تمام پروژه‌ها دسترسی دارد
    if (user?.systemRole === SystemRole.ADMIN) {
      return true;
    }

    const projectId = request.params.projectId || request.params.id;
    if (!projectId) {
      throw new ForbiddenException('شناسه پروژه در درخواست مشخص نیست');
    }

    // لایه دوم: بررسی عضویت و نقش کاربر در همین پروژه خاص
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.userId,
          projectId,
        },
      },
    });

    if (!membership || !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        'شما سطح دسترسی لازم برای این عملیات در این پروژه را ندارید',
      );
    }

    request.projectRole = membership.role;
    return true;
  }
}