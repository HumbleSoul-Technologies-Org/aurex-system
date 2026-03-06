import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

// Axios instance for GET only
const axiosClient = axios.create({
  baseURL: BASE_URL,
  
});

// Throws error if response is not OK
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Handles POST / PUT / PATCH / DELETE
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    // Don't include credentials by default - let the backend handle CORS properly
    // credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  timeout?: number; // optional timeout in ms
}) => QueryFunction<T> =
  ({ on401, timeout = 5000 }) =>
  async ({ queryKey, signal }) => {
    // React Query passes its own abort signal
    const controller = new AbortController();

    // If React Query aborts, abort axios request too
    signal?.addEventListener("abort", () => controller.abort());

    // Custom timeout abort
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `/${queryKey.join("/")}`;

      const response = await axiosClient.get(url, {
        signal: controller.signal,
        withCredentials: false, // Explicitly disable credentials for GET requests
      });

      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        throw new Error("Request cancelled");
      }

      if (error.response?.status === 401 && on401 === "returnNull") {
        return null;
      }

      throw new Error(error.response?.data || error.message);
    } finally {
      clearTimeout(timer);
    }
  };


// React Query Global Config
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: 5000,
      refetchOnWindowFocus: false,
      staleTime: 10000,
      retry: true,
    },
    mutations: {
      retry: true,
    },
  },
});
