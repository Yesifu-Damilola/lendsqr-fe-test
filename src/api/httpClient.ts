import axios from "axios";

const DEFAULT_BASE_URL = "https://run.mocky.io/v3";
const RAW_BASE_URL = process.env.NEXT_PUBLIC_MOCK_API_BASE_URL;
const BASE_URL = RAW_BASE_URL?.trim() || DEFAULT_BASE_URL;

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
