import { createContext } from "react";
import type { AuthUser } from "../types/auth";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  loginWithGoogle: (
    credential: string
  ) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
};

export const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );