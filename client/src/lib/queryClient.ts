const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<any> {
  const response = await fetch(`${API_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API Error");
  }

  return response.json();
}
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();
