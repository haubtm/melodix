import { RecentlyPlayedItem, RecordPlayRequest } from "@/dtos";
import { axiosService } from "./axiosService";

export const playbackApi = {
  recordPlay: async (payload: RecordPlayRequest): Promise<void> => {
    await axiosService.post("/playback/play", payload);
  },

  getRecentlyPlayed: async (limit: number = 20): Promise<RecentlyPlayedItem[]> => {
    const response = await axiosService.get("/playback/recently-played", {
      params: { limit },
    });

    return response.data?.data || response.data;
  },
};
