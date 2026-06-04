function splitFullName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/** Map Prisma user to legacy Mongo-style shape for the admin UI */
export function toLegacyUser(user, extras = {}) {
  const { firstName, lastName } = splitFullName(user.fullName);

  return {
    _id: user.id,
    id: user.id,
    firstName,
    lastName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role?.name || "customer",
    isActive: !user.isBlocked,
    isBlocked: user.isBlocked,
    isVerified: user.isVerified ?? false,
    provider: user.provider,
    image: user.profileImage,
    orderCount: extras.orderCount ?? user._count?.orders ?? 0,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toFullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}
