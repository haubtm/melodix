import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_S3_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS Setup is missing in .env');
    }

    this.region = region;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'melodix-backend');
  }

  /**
   * Extract S3 key from a full S3 URL
   * e.g. https://bucket.s3.region.amazonaws.com/songs/uuid.mp3 → songs/uuid.mp3
   */
  extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.substring(1);
    } catch {
      // If not a valid URL, assume it's already a key
      return url;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<{ url: string; key: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;

      return {
        url,
        key: fileName,
      };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Get file metadata (ContentLength, ContentType) from S3
   */
  async getFileMetadata(key: string): Promise<{
    contentLength: number;
    contentType: string;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        contentLength: response.ContentLength || 0,
        contentType: response.ContentType || 'audio/mpeg',
      };
    } catch (error: any) {
      if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
        throw new NotFoundException('File not found on S3');
      }
      console.error('S3 HeadObject Error:', error);
      throw new InternalServerErrorException('Failed to get file metadata from S3');
    }
  }

  /**
   * Get a readable stream from S3, optionally with Range support
   */
  async getFileStream(key: string, range?: string): Promise<{
    stream: Readable;
    contentLength: number;
    contentType: string;
    contentRange?: string;
    statusCode: number;
  }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ...(range && { Range: range }),
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;

      return {
        stream,
        contentLength: response.ContentLength || 0,
        contentType: response.ContentType || 'audio/mpeg',
        contentRange: response.ContentRange,
        statusCode: response.ContentRange ? 206 : 200,
      };
    } catch (error: any) {
      if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
        throw new NotFoundException('File not found on S3');
      }
      console.error('S3 GetObject Error:', error);
      throw new InternalServerErrorException('Failed to stream file from S3');
    }
  }
}
