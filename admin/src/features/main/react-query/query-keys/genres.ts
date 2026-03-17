import { IGenreListRequest } from "@/dtos";

export const genreKeys = {
  all: ["genres"] as const,
  lists: () => [...genreKeys.all, "list"] as const,
  list: (params: IGenreListRequest) => [...genreKeys.lists(), params] as const,
  details: () => [...genreKeys.all, "detail"] as const,
  detail: (id: number) => [...genreKeys.details(), id] as const,
  selects: () => [...genreKeys.all, "select"] as const,
  select: (params: IGenreListRequest) =>
    [...genreKeys.selects(), params] as const,
};
