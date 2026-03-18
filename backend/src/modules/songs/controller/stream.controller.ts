import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  ParseIntPipe,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../../../common/decorator/public.decorator';
import { SongService } from '../service/song.service';
import { UploadService } from '../../upload/service/upload.service';

@ApiTags('songs')
@Controller('songs')
export class StreamController {
  constructor(
    private readonly songService: SongService,
    private readonly uploadService: UploadService,
  ) {}

  @Get(':id/stream')
  @Public()
  @ApiOperation({ summary: 'Stream a song audio file with Range support' })
  @ApiParam({ name: 'id', description: 'Song ID' })
  @ApiResponse({ status: 200, description: 'Full audio file' })
  @ApiResponse({ status: 206, description: 'Partial audio content (Range request)' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async stream(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    // 1. Get song from DB
    const song = await this.songService.findOne(id);
    console.log(song.audioUrl);
    if (!song || !song.audioUrl) {
      console.log('11233133');
      throw new NotFoundException('Song or audio file not found');
    }

    // 2. Extract S3 key from audioUrl
    const s3Key = this.uploadService.extractKeyFromUrl(song.audioUrl);

    // 3. Get Range header
    const range = req.headers.range;

    if (range) {
      // 4a. Range request → get file metadata first for Content-Range header
      const metadata = await this.uploadService.getFileMetadata(s3Key);
      const fileSize = metadata.contentLength;

      // Parse range (e.g., "bytes=0-1048575")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;

      // Get stream with range
      const result = await this.uploadService.getFileStream(s3Key, `bytes=${start}-${end}`);

      res.status(HttpStatus.PARTIAL_CONTENT);
      res.set({
        'Content-Type': metadata.contentType,
        'Content-Length': chunkSize.toString(),
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });

      result.stream.pipe(res);
    } else {
      // 4b. Full request → stream entire file
      const result = await this.uploadService.getFileStream(s3Key);

      res.status(HttpStatus.OK);
      res.set({
        'Content-Type': result.contentType,
        'Content-Length': result.contentLength.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });

      result.stream.pipe(res);
    }
  }
}
