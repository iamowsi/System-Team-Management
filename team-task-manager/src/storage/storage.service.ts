import 'multer';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('S3_BUCKET', 'task-attachments');

    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.config.get<string>('S3_ENDPOINT', 'http://localhost:4566'),
      forcePathStyle: true, // ضروری برای کار کردن با LocalStack و MinIO
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID', 'test'),
        secretAccessKey: this.config.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          'test',
        ),
      },
    });
  }

  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      console.log(`S3 Bucket "${this.bucket}" created automatically.`);
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'attachments') {
    const safeName = file.originalname.replace(/\s+/g, '-');
    const key = `${folder}/${randomUUID()}-${safeName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return { key };
  }

  async getDownloadUrl(key: string, expiresInSeconds = 900) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  async deleteFile(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}