import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { AuthContext } from "./authContext";
import type { AuthUser } from "../types/auth";
import * as authService from "../services/authService";

type Props = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(() =>
    authService.hasAuthToken()
  );

  /* =========================================
     RESTORE AUTH SESSION
  ========================================= */

  useEffect(() => {
    if (!authService.hasAuthToken()) {
      return;
    }

    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => {
        authService.logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* =========================================
     EMAIL + PASSWORD LOGIN
  ========================================= */

  const login = async (
    email: string,
    password: string
  ) => {
    const authenticatedUser =
      await authService.login(
        email,
        password
      );

    setUser(authenticatedUser);
  };

  /* =========================================
     GOOGLE LOGIN
  ========================================= */

  const loginWithGoogle = async (
    credential: string
  ) => {
    const authenticatedUser =
      await authService.loginWithGoogle(
        credential
      );

    setUser(authenticatedUser);
  };

  /* =========================================
     REGISTER
  ========================================= */

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const authenticatedUser =
      await authService.register(
        name,
        email,
        password
      );

    setUser(authenticatedUser);
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}