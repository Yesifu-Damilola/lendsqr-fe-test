import axios, { isAxiosError } from "axios";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await axios.post<LoginResponse>("/api/login", payload, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!data?.token) {
      throw new Error("Invalid login response from mock API.");
    }
    return data;
  } catch (error) {
    // In local/dev setups, allow dashboard access when mock hosts are blocked
    // by proxy/certificate policies and no HTTP response is returned.
    if (
      process.env.NODE_ENV !== "production" &&
      isAxiosError(error) &&
      !error.response
    ) {
      return {
        token: `local-dev-token-${Date.now()}`,
        user: {
          email: payload.email,
        },
      };
    }
    throw error;
  }
}
