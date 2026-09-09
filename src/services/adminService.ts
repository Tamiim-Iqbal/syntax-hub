import type { AuthUser } from "../types/auth";
import { getAuthToken } from "./authService";
import type { Course } from "../types/course";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5050/api";

export type AdminOverview = {
  users: number;
  courses: number;
  publishedCourses: number;
  admins: number;
};

export type AdminUser = AuthUser & {
  createdAt: string;
  updatedAt: string;
};

export type AdminCourse = Course & {
  isPublished: boolean;
  order: number;
};

const request = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const token = getAuthToken();

  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = (await response.json()) as {
    success: boolean;
    message?: string;
    data: T;
  };

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Admin request failed");
  }

  return result.data;
};

export const getAdminOverview =
  () => request<AdminOverview>("/admin/overview");

export const getAdminUsers =
  () => request<AdminUser[]>("/admin/users");

export const updateUserRole = (
  id: string,
  role: "user" | "admin"
) =>
  request<AdminUser>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const getAdminCourses =
  () => request<AdminCourse[]>("/admin/courses");

type CoursePayload = {
  title: string;
  slug: string;
  category: string;
  type: "single-language" | "multi-language" | "problem-solving";
  description: string;
  level: string;
  content: unknown;
  languages?: unknown[];
  isPublished: boolean;
  order: number;
};

export const createAdminCourse = (
  payload: CoursePayload
) =>
  request<AdminCourse>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminCourse = (
  id: string,
  payload: Partial<CoursePayload>
) =>
  request<AdminCourse>(`/admin/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteAdminCourse = (id: string) =>
  request<{ message: string }>(`/admin/courses/${id}`, {
    method: "DELETE",
  });
