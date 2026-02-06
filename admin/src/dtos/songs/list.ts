import { PaginatedRequest } from "../common";

export interface ListSongsRequest extends PaginatedRequest {
  status?: string;
  artistId?: number;
}
