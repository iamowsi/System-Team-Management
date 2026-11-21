import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [MailModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}