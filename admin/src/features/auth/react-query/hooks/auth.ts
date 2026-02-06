import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api";
import { LoginRequest } from "@/dtos";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
  });
};

export const useProfile = () => {
  return useMutation({
    mutationFn: () => authApi.getProfile(),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      authApi.logout();
      return true;
    },
  });
};
