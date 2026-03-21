import { ApiProperty } from '@nestjs/swagger';

export class SearchResponseDto<TSong = unknown, TArtist = unknown, TAlbum = unknown, TPlaylist = unknown> {
  @ApiProperty({ type: [Object] })
  songs: TSong[];

  @ApiProperty({ type: [Object] })
  artists: TArtist[];

  @ApiProperty({ type: [Object] })
  albums: TAlbum[];

  @ApiProperty({ type: [Object] })
  playlists: TPlaylist[];
}
