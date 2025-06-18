import jwt from "jsonwebtoken";
import { db } from "../config/database";
import { RequestHandler, Request } from "express";

export const authenticateToken: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default");
    const user = await db.getUserByHandle((decoded as any).handle);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // @ts-ignore
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error:
        "message" in (error as any) ? (error as any).message : "Invalid token",
    });
    return;
  }
};
