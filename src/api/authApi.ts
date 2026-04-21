import axios, { isAxiosError } from "axios";
import type { LoginRequest, LoginResponse } from "@/types/auth";

const DEFAULT_BASE_URL = "https://run.mocky.io/v3";
const LOGIN_ENDPOINT = "login";
const RAW_BASE_URL = process.env.NEXT_PUBLIC_MOCK_API_BASE_URL;
const BASE_URL = RAW_BASE_URL?.trim() || DEFAULT_BASE_URL;
const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL?.trim();

function shouldUseRootRelativeLoginEndpoint(baseUrl: string): boolean {
  try {
    const pathnameParts = new URL(baseUrl).pathname
      .split("/")
      .filter(Boolean);
    // Mocky collection root looks like /v3, while a published mock endpoint
    // looks like /v3/{uuid}. For /v3/{uuid}, post directly to baseURL.
    return !(pathnameParts[0] === "v3" && pathnameParts.length >= 2);
  } catch {
    return true;
  }
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const requestConfig = {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = LOGIN_URL
      ? await axios.post<LoginResponse>(LOGIN_URL, payload, requestConfig)
      : await axios.post<LoginResponse>(
          shouldUseRootRelativeLoginEndpoint(BASE_URL) ? LOGIN_ENDPOINT : "",
          payload,
          {
            ...requestConfig,
            baseURL: BASE_URL,
          },
        );
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
