import apiService from "./axiosService";

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

    const response = await apiService.post<UploadResponse>(
      "/upload",
      formData as unknown as object,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};

export default uploadApi;
