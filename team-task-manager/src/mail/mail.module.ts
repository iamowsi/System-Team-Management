import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'email' })],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}