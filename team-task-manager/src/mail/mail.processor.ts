import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('email')
export class MailProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: Number(this.config.get<number>('SMTP_PORT', 1025)),
      secure: false,
    });
  }

  async process(
    job: Job<{ to: string; taskTitle: string; projectName: string }>,
  ) {
    if (job.name === 'task-assigned') {
      const { to, taskTitle, projectName } = job.data;

      await this.transporter.sendMail({
        from: '"Team Task Manager" <no-reply@taskmanager.local>',
        to,
        subject: `تسک جدید برای شما در پروژه ${projectName}`,
        text: `سلام!\nتسک «${taskTitle}» در پروژه «${projectName}» به شما محول شد.`,
        html: `<h3>تسک جدید</h3><p>تسک <b>${taskTitle}</b> در پروژه <b>${projectName}</b> به شما محول شد.</p>`,
      });

      console.log(`Background Email Sent to ${to} (Job ID: ${job.id})`);
    }
  }
}