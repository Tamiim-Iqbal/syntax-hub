import crypto from "node:crypto";
import type { Response } from "express";
import type { AuthRequest } from "../types/auth.js";

export const getImageKitAuth = async (
  _req: AuthRequest,
  res: Response
) => {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

  if (!privateKey || !publicKey) {
    res.status(503).json({
      success: false,
      message: "ImageKit is not configured on the server",
    });
    return;
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  res.status(200).json({
    success: true,
    data: { token, expire, signature, publicKey },
  });
};
