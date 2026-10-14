import type { AuthUser } from "../types/auth";
import { getAuthToken } from "./authService";
import type { Course } from "../types/course";
import { clearCourseListCache } from "./courseService";

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
  emailVerified: boolean;
  lastVisitedAt?: string | null;
};

export type AdminCourse = Course & {
  isPublished: boolean;
  isTopLevel?: boolean;
  order: number;
  content?: unknown;
  languages?: import("../types/course").CourseLanguage[];
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

export const getAdminUsers = async () => {
  const rows = await request<Array<AdminUser & { _id?: string }>>("/admin/users");
  return rows.map((item) => ({ ...item, id: item.id || item._id || "" }));
};

export const updateUserRole = (
  id: string,
  role: "user" | "moderator" | "admin"
) =>
  request<AdminUser & { _id?: string }>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  }).then((item) => ({ ...item, id: item.id || item._id || id }));

export const getAdminCourses =
  () => request<AdminCourse[]>("/admin/courses");

type CoursePayload = {
  title: string;
  slug: string;
  category: string;
  type: "single-language" | "multi-language" | "problem-solving" | "nested";
  description: string;
  level: string;
  content: unknown;
  languages?: unknown[];
  isPublished: boolean;
  isTopLevel?: boolean;
  order: number;
};

export const createAdminCourse = async (
  payload: CoursePayload
) => {
  const course = await request<AdminCourse>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  clearCourseListCache();
  return course;
};

export const updateAdminCourse = async (
  id: string,
  payload: Partial<CoursePayload>
) => {
  const course = await request<AdminCourse>(`/admin/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  clearCourseListCache();
  return course;
};

export const deleteAdminCourse = async (id: string) => {
  const result = await request<{ message: string }>(`/admin/courses/${id}`, {
    method: "DELETE",
  });
  clearCourseListCache();
  return result;
};


export type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

export const getImageKitAuth = () =>
  request<ImageKitAuth>("/admin/imagekit/auth");

export type PopupPosition = "center" | "bottom-left" | "bottom-right" | "top-left" | "top-right" | "top-center";
export type AdminPopupItem = { _id?: string; title: string; html?: string; sticker?: string; sections?: import("../types/course").ContentSection[]; delayMinutes: number; delaySeconds?: number; closeAfterSeconds: number; allowManualClose: boolean; enabled: boolean; position?: PopupPosition; size?: "default" | "small" };
export type AdminPopupConfig = { enabled: boolean; items: AdminPopupItem[] };
export const getAdminPopups = () => request<AdminPopupConfig>("/admin/popups");
export const saveAdminPopups = (config: AdminPopupConfig) => request<AdminPopupConfig>("/admin/popups", { method: "PUT", body: JSON.stringify(config) });
