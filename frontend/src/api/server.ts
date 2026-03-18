import "server-only";

import { API_BASE_URL } from "./axiosService";

type NextRequestOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function serverGet<T>(
  path: string,
  init?: NextRequestOptions,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  return parseResponse<T>(response);
}

export async function serverPost<T>(
  path: string,
  body?: unknown,
  init?: NextRequestOptions,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseResponse<T>(response);
}
