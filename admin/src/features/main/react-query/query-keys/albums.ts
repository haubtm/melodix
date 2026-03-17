import { IAlbumListRequest } from "@/dtos";

export const albumKeys = {
  all: ["albums"] as const,
  lists: () => [...albumKeys.all, "list"] as const,
  list: (params: IAlbumListRequest) => [...albumKeys.lists(), params] as const,
  details: () => [...albumKeys.all, "detail"] as const,
  detail: (id: number) => [...albumKeys.details(), id] as const,
  selects: () => [...albumKeys.all, "select"] as const,
  select: (params: IAlbumListRequest) =>
    [...albumKeys.selects(), params] as const,
};
