export function isAdminEmail(email) {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(String(email || "").toLowerCase());
}

export function isAdminUser(user) {
  return user?.role === "admin" || isAdminEmail(user?.email);
}

export function profileWithAdmin(user) {
  const isAdmin = isAdminUser(user);

  return {
    ...user.toProfile(),
    role: isAdmin ? "admin" : user.role || "user",
    isAdmin,
  };
}
