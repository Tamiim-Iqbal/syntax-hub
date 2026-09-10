import type {
  AuthResponse,
  AuthUser,
} from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5050/api";
const TOKEN_KEY = "syntaxhub-auth-token";

const request = async <T>(
  path: string,
  options?: RequestInit
): Promise<T> => {
  const token =
    localStorage.getItem(TOKEN_KEY);

  const headers = new Headers(
    options?.headers
  );

  headers.set(
    "Content-Type",
    "application/json"
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  let response: Response | undefined;

  // A login can happen immediately after navigating from a course page.
  // Retry one time for a transient browser/network failure so a momentary
  // connection hiccup does not turn into a misleading login failure.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch(
        `${API_URL}${path}`,
        {
          ...options,
          headers,
        }
      );
      break;
    } catch {
      if (attempt === 1) {
        throw new Error(
          `Unable to connect to SyntaxHub API at ${API_URL}. Make sure the backend is running on port 5050.`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  if (!response) {
    throw new Error("Unable to connect to SyntaxHub API.");
  }

  const raw = await response.text();
  let result: (T & { message?: string }) | null = null;

  try {
    result = raw ? JSON.parse(raw) : null;
  } catch {
    // Keep a useful error instead of exposing a JSON parse exception.
  }

  if (!response.ok) {
    throw new Error(
      result?.message ?? `Request failed (${response.status})`
    );
  }

  if (!result) {
    throw new Error("The server returned an empty response.");
  }

  return result;
};

/* =========================================
   REGISTER
========================================= */

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const result =
    await request<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

  localStorage.setItem(
    TOKEN_KEY,
    result.data.token
  );

  return result.data.user;
};

/* =========================================
   LOGIN
========================================= */

export const login = async (
  email: string,
  password: string
) => {
  const result =
    await request<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

  localStorage.setItem(
    TOKEN_KEY,
    result.data.token
  );

  return result.data.user;
};

/* =========================================
   GOOGLE LOGIN
========================================= */

export const loginWithGoogle = async (
  credential: string
) => {
  const result =
    await request<AuthResponse>(
      "/auth/google",
      {
        method: "POST",
        body: JSON.stringify({
          credential,
        }),
      }
    );

  localStorage.setItem(
    TOKEN_KEY,
    result.data.token
  );

  return result.data.user;
};

/* =========================================
   CURRENT USER
========================================= */

export const getCurrentUser =
  async (): Promise<AuthUser> => {
    const result =
      await request<{
        success: boolean;
        data: AuthUser;
      }>("/auth/me");

    return result.data;
  };

/* =========================================
   LOGOUT
========================================= */

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/* =========================================
   AUTH TOKEN
========================================= */

export const hasAuthToken = () =>
  Boolean(
    localStorage.getItem(TOKEN_KEY)
  );
export const getAuthToken = () =>
  localStorage.getItem(TOKEN_KEY);
