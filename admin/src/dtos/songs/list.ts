import { IPaginatedResponse } from "@/api/axiosService";
import { PaginatedRequest } from "../common";
import { Song, SongStatus } from "./entity";

export interface ListSongsRequest extends PaginatedRequest {
  status?: SongStatus;
  artistId?: number;
  albumId?: number;
  genreId?: number;
}

export type ISongListResponse = IPaginatedResponse<Song>;
