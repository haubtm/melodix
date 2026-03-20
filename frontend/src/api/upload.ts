import { axiosService } from "./axiosService";

function unwrapEntity<T extends object>(payload: T | { data: T }): T {
  return ("data" in payload ? payload.data : payload) as T;
}

export const uploadApi = {
  uploadFile: async (file: File, folder: string = "general"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await axiosService.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const payload = unwrapEntity<{ url: string; key: string }>(response.data);
    return payload.url;
  },
};
