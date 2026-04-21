import type { UseMutationOptions } from "@tanstack/react-query";
import { login } from "@/api/authApi";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export function loginMutationOptions(): UseMutationOptions<
  LoginResponse,
  Error,
  LoginRequest
> {
  return {
    mutationFn: login,
  };
}
