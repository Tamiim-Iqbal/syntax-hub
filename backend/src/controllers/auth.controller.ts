import type {
  Request,
  Response,
} from "express";

import {
  OAuth2Client,
} from "google-auth-library";

import {
  getUserById,
  loginUser,
  loginWithGoogleUser,
  registerUser,
} from "../services/auth.service.js";

import type {
  AuthRequest,
} from "../types/auth.js";

const googleClient =
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
  );

const validCredentials = (
  name: string,
  email: string,
  password: string
) =>
  name.trim().length >= 2 &&
  email.includes("@") &&
  password.length >= 8;

/* =========================================
   REGISTER
========================================= */

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body as Record<
      string,
      unknown
    >;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !validCredentials(
        name,
        email,
        password
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, valid email and password (minimum 8 characters) are required",
      });

      return;
    }

    const result =
      await registerUser(
        name,
        email,
        password
      );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name ===
        "DuplicateEmailError"
    ) {
      res.status(409).json({
        success: false,
        message:
          "Email is already registered",
      });

      return;
    }

    console.error(
      "Register error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create account",
    });
  }
};

/* =========================================
   LOGIN
========================================= */

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
    } = req.body as Record<
      string,
      unknown
    >;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.includes("@") ||
      password.length < 8
    ) {
      res.status(400).json({
        success: false,
        message:
          "Valid email and password are required",
      });

      return;
    }

    const result =
      await loginUser(
        email,
        password
      );

    if (!result) {
      res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

/* =========================================
   GOOGLE LOGIN
========================================= */

export const loginWithGoogle =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        credential,
      } = req.body as Record<
        string,
        unknown
      >;

      if (
        typeof credential !== "string" ||
        !credential.trim()
      ) {
        res.status(400).json({
          success: false,
          message:
            "Google credential is required",
        });

        return;
      }

      const ticket =
        await googleClient.verifyIdToken({
          idToken: credential,
          audience:
            process.env
              .GOOGLE_CLIENT_ID,
        });

      const payload =
        ticket.getPayload();

      if (
        !payload ||
        !payload.email
      ) {
        res.status(401).json({
          success: false,
          message:
            "Invalid Google credential",
        });

        return;
      }

      if (
        payload.email_verified !== true
      ) {
        res.status(401).json({
          success: false,
          message:
            "Google email is not verified",
        });

        return;
      }

      const result =
        await loginWithGoogleUser({
          name:
            payload.name ??
            payload.email.split(
              "@"
            )[0],

          email: payload.email,
        });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "Google login error:",
        error
      );

      res.status(401).json({
        success: false,
        message:
          "Failed to authenticate with Google",
      });
    }
  };

/* =========================================
   CURRENT USER
========================================= */

export const me = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    const user =
      await getUserById(
        req.user.id
      );

    if (!user) {
      res.status(401).json({
        success: false,
        message:
          "User no longer exists",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch current user",
    });
  }
};