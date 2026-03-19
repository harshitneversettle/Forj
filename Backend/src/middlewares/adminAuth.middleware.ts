import { Request, Response, NextFunction } from "express";
import { db } from "../db";

export async function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { address } = req.body;
    const address_fetched = await db.admins.findUnique({
      where: { address: address },
    });

    if (!address) {
      res.status(401).json({ error: "address is required" });
      return;
    }
    if (!address_fetched) {
      res.status(401).json({ error: "admin not found" });
      return;
    }

    if (address == address_fetched) next();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
}
