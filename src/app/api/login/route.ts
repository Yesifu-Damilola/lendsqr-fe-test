import axios, { isAxiosError } from "axios";
import { NextResponse } from "next/server";
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
    return !(pathnameParts[0] === "v3" && pathnameParts.length >= 2);
  } catch {
    return true;
  }
}

function fallbackLoginResponse(email: string): LoginResponse {
  return {
    token: `fallback-token-${Date.now()}`,
    user: { email },
  };
}

export async function POST(request: Request) {
  let payload: LoginRequest;
  try {
    payload = (await request.json()) as LoginRequest;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload?.email || !payload?.password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const requestConfig = {
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    };
    const { data } = LOGIN_URL
      ? await axios.post<LoginResponse>(LOGIN_URL, payload, requestConfig)
      : await axios.post<LoginResponse>(
          shouldUseRootRelativeLoginEndpoint(BASE_URL) ? LOGIN_ENDPOINT : "",
          payload,
          { ...requestConfig, baseURL: BASE_URL },
        );

    if (!data?.token) {
      return NextResponse.json(fallbackLoginResponse(payload.email));
    }
    return NextResponse.json(data);
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return NextResponse.json(
        { message: `Upstream login failed (${error.response.status}).` },
        { status: error.response.status },
      );
    }
    // Keep mock login usable even when upstream is unavailable in deployments.
    return NextResponse.json(fallbackLoginResponse(payload.email));
  }
}
