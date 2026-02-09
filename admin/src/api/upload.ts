import axios from "axios";
import { STORAGE_KEY } from "@/common/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface UploadResponse {
  url: string;
  filename: string;
}

export const uploadApi = {
  uploadFile: async (
    file: File,
    folder: string = "general",
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const token = localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);

    const response = await axios.post<{
      status: number;
      message: string;
      data: UploadResponse;
    }>(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data.data;
  },
};

export default uploadApi;
