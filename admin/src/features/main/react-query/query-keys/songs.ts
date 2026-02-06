import { ListSongsRequest } from "@/dtos";

export const songKeys = {
  all: ["songs"] as const,
  lists: () => [...songKeys.all, "list"] as const,
  list: (filters: ListSongsRequest) =>
    [...songKeys.lists(), { filters }] as const,
  details: () => [...songKeys.all, "detail"] as const,
  detail: (id: number) => [...songKeys.details(), id] as const,
};
