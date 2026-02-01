import { ApiProperty } from '@nestjs/swagger';
import { SongResponseDto } from '../../songs/dto/song-response.dto';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class PlaylistSongResponseDto {
  @ApiProperty()
  @Expose()
  id: number; // This could be the playlist_song id or just mapped from song

  @ApiProperty()
  @Expose()
  @Type(() => SongResponseDto)
  song: SongResponseDto;

  @ApiProperty()
  @Expose()
  addedAt: Date;

  @ApiProperty({ nullable: true })
  @Expose()
  addedBy: number | null;

  @ApiProperty()
  @Expose()
  position: number;

  constructor(partial: Partial<PlaylistSongResponseDto>) {
    Object.assign(this, partial);
  }
}
