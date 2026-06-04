import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { toLegacyUser } from "../utils/userMapper.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user || user.isBlocked) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = toLegacyUser(user);
    req.userRecord = user;
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
