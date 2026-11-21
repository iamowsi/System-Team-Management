import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendTaskAssignedEmail(
    to: string,
    taskTitle: string,
    projectName: string,
  ) {
    await this.emailQueue.add(
      'task-assigned',
      { to, taskTitle, projectName },
      {
        attempts: 3, // در صورت خطا تا ۳ بار دوباره تلاش کند
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  }
}