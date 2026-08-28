import type {
  AuthResponse,
  AuthUser,
} from "../types/auth";

const API_URL = "http://localhost:5050/api";
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

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  const result =
    (await response.json()) as T & {
      message?: string;
    };

  if (!response.ok) {
    throw new Error(
      result.message ?? "Request failed"
    );
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