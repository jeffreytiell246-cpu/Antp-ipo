import jwt from "jsonwebtoken";

const accessTokenTtl = "15m";
const refreshTokenTtl = "7d";

export function createAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: accessTokenTtl,
  });
}

export function createRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenTtl,
  });
}

export function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
