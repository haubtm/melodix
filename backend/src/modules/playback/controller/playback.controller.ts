import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RecordPlayDto } from '../dto';
import { PlaybackService } from '../service/playback.service';

@ApiTags('playback')
@Controller('playback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlaybackController {
  constructor(private readonly playbackService: PlaybackService) {}

  @Post('play')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a song play' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Play recorded successfully' })
  recordPlay(@CurrentUser() user: User, @Body() dto: RecordPlayDto) {
    return this.playbackService.recordPlay(user, dto);
  }

  @Get('recently-played')
  @ApiOperation({ summary: 'Get recently played songs for current user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recently played songs returned' })
  getRecentlyPlayed(@CurrentUser() user: User, @Query('limit') limit: number = 20) {
    return this.playbackService.getRecentlyPlayed(user, Number(limit));
  }
}
