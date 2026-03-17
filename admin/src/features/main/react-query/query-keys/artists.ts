import { IArtistListRequest } from "@/dtos";

export const artistKeys = {
  all: ["artists"] as const,
  lists: () => [...artistKeys.all, "list"] as const,
  list: (params: IArtistListRequest) =>
    [...artistKeys.lists(), params] as const,
  details: () => [...artistKeys.all, "detail"] as const,
  detail: (id: number) => [...artistKeys.details(), id] as const,
  usersForSelect: () => ["users", "select"] as const,
  userSelect: (params: object) =>
    [...artistKeys.usersForSelect(), params] as const,
  artistsForSelect: () => [...artistKeys.all, "select"] as const,
  artistSelect: (params: object) =>
    [...artistKeys.artistsForSelect(), params] as const,
};
