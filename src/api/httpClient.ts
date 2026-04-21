import axios from "axios";

const DEFAULT_BASE_URL = "https://run.mocky.io/v3";

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MOCK_API_BASE_URL ?? DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
