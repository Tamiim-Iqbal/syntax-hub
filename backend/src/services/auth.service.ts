import {
  createHmac,
  randomBytes,
  pbkdf2Sync,
  timingSafeEqual,
} from "node:crypto";

import User, {
  type UserRole,
} from "../models/User.js";

import type {
  AuthUser,
} from "../types/auth.js";

const JWT_SECRET =
  process.env.JWT_SECRET ??
  "syntaxhub-development-secret-change-me";

const JWT_EXPIRES_IN_SECONDS =
  60 * 60 * 24 * 7;

const PASSWORD_ITERATIONS = 210_000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";

type JwtPayload = AuthUser & {
  iat: number;
  exp: number;
};

type GoogleUser = {
  name: string;
  email: string;
};

const base64Url = (
  value: string | Buffer
) =>
  Buffer.from(value).toString(
    "base64url"
  );

const signToken = (
  payload: JwtPayload
) => {
  const header = base64Url(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT",
    })
  );

  const body = base64Url(
    JSON.stringify(payload)
  );

  const signature = createHmac(
    "sha256",
    JWT_SECRET
  )
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
};

export const verifyToken = (
  token: string
): AuthUser | null => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const [
      header,
      body,
      signature,
    ] = parts;

    const expected = createHmac(
      "sha256",
      JWT_SECRET
    )
      .update(`${header}.${body}`)
      .digest("base64url");

    const actualBuffer =
      Buffer.from(signature);

    const expectedBuffer =
      Buffer.from(expected);

    if (
      actualBuffer.length !==
        expectedBuffer.length ||
      !timingSafeEqual(
        actualBuffer,
        expectedBuffer
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(
        body,
        "base64url"
      ).toString()
    ) as JwtPayload;

    if (
      payload.exp <=
      Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

const hashPassword = (
  password: string
) => {
  const salt = randomBytes(16).toString(
    "hex"
  );

  const hash = pbkdf2Sync(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST
  ).toString("hex");

  return `pbkdf2:${PASSWORD_DIGEST}:${PASSWORD_ITERATIONS}:${salt}:${hash}`;
};

const verifyPassword = (
  password: string,
  stored: string
) => {
  const [
    algorithm,
    digest,
    iterationsText,
    salt,
    storedHash,
  ] = stored.split(":");

  if (
    algorithm !== "pbkdf2" ||
    !digest ||
    !iterationsText ||
    !salt ||
    !storedHash
  ) {
    return false;
  }

  const derived = pbkdf2Sync(
    password,
    salt,
    Number(iterationsText),
    PASSWORD_KEY_LENGTH,
    digest
  ).toString("hex");

  const a = Buffer.from(derived);
  const b = Buffer.from(storedHash);

  return (
    a.length === b.length &&
    timingSafeEqual(a, b)
  );
};

const toAuthUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  role: UserRole;
}): AuthUser => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

const createToken = (
  user: AuthUser
) => {
  const now = Math.floor(
    Date.now() / 1000
  );

  return signToken({
    ...user,
    iat: now,
    exp:
      now +
      JWT_EXPIRES_IN_SECONDS,
  });
};

/* =========================================
   REGISTER
========================================= */

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const normalizedEmail =
    email.trim().toLowerCase();

  const existing =
    await User.findOne({
      email: normalizedEmail,
    }).lean();

  if (existing) {
    const error = new Error(
      "Email already registered"
    );

    error.name =
      "DuplicateEmailError";

    throw error;
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash:
      hashPassword(password),
    role: "user",
  });

  const authUser =
    toAuthUser(user);

  return {
    user: authUser,
    token: createToken(authUser),
  };
};

/* =========================================
   LOGIN
========================================= */

export const loginUser = async (
  email: string,
  password: string
) => {
  const user =
    await User.findOne({
      email: email
        .trim()
        .toLowerCase(),
    }).select("+passwordHash");

  if (
    !user ||
    !user.passwordHash ||
    !verifyPassword(
      password,
      user.passwordHash
    )
  ) {
    return null;
  }

  const authUser =
    toAuthUser(user);

  return {
    user: authUser,
    token: createToken(authUser),
  };
};

/* =========================================
   GOOGLE LOGIN
========================================= */

export const loginWithGoogleUser =
  async (
    googleUser: GoogleUser
  ) => {
    const normalizedEmail =
      googleUser.email
        .trim()
        .toLowerCase();

    let user =
      await User.findOne({
        email: normalizedEmail,
      });

    /* =====================================
       EXISTING USER
    ===================================== */

    if (user) {
      if (
        googleUser.name.trim() &&
        user.name !==
          googleUser.name.trim()
      ) {
        user.name =
          googleUser.name.trim();

        await user.save();
      }

      const authUser =
        toAuthUser(user);

      return {
        user: authUser,
        token: createToken(authUser),
      };
    }

    /* =====================================
       NEW GOOGLE USER
    ===================================== */

    user = await User.create({
      name:
        googleUser.name.trim() ||
        "SyntaxHub User",

      email: normalizedEmail,

      /*
       * Google users do not authenticate
       * using our password system.
       *
       * A random value prevents the field
       * from being usable as a real password.
       */
      passwordHash:
        hashPassword(
          randomBytes(32).toString(
            "hex"
          )
        ),

      role: "user",
    });

    const authUser =
      toAuthUser(user);

    return {
      user: authUser,
      token: createToken(authUser),
    };
  };

export const getUserById = async (
  id: string
) => {
  const user =
    await User.findById(id);

  return user
    ? toAuthUser(user)
    : null;
};