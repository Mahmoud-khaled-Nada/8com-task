// Cookie configuration
export const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export const REFRESH_COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  httpOnly: false, // Note: js-cookie can't set httpOnly, handle server-side if needed
};
