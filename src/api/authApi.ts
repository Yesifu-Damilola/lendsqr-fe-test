import axios, { isAxiosError } from "axios";
import type { LoginRequest, LoginResponse } from "@/types/auth";

const DEFAULT_BASE_URL = "https://run.mocky.io/v3";
const LOGIN_ENDPOINT = "login";
const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL;
const RAW_BASE_URL = process.env.NEXT_PUBLIC_MOCK_API_BASE_URL;
const BASE_URL = RAW_BASE_URL?.trim() || DEFAULT_BASE_URL;

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const target = LOGIN_URL?.trim() || LOGIN_ENDPOINT;
    const { data } = await axios.post<LoginResponse>(target, payload, {
      baseURL: BASE_URL,
      timeout: 1000,
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
