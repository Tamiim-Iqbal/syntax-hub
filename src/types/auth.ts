export type UserRole = "user" | "moderator" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  success: boolean;
  data: {
    user: AuthUser;
    token: string;
  };
};
