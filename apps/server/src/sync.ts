import express from "express";
import { auth, getDb } from "./auth.js";
import crypto from "crypto";

const router = express.Router();

const MAX_DATA_SIZE_BYTES = 200 * 1024; // 200KB

function calculateDataHash(data: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex")
    .slice(0, 16);
}

function getDataSize(data: unknown): number {
  return JSON.stringify(data).length;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// Lightweight status check — returns metadata without the full data payload
router.get("/status", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const db = await getDb();
    const userDb = await db.collection("databases").findOne(
      { userId: session.user.id },
      { projection: { data: 0 } }, // Exclude the large data field
    );

    if (!userDb) {
      res.json({
        hasData: false,
        lastSync: null,
        dataHash: null,
        dataSize: null,
      });
      return;
    }

    res.json({
      hasData: true,
      lastSync: userDb.lastSync,
      dataHash: userDb.dataHash,
      dataSize: userDb.dataSize,
    });
  } catch (error) {
    console.error("Sync status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const db = await getDb();
    const userDb = await db
      .collection("databases")
      .findOne({ userId: session.user.id });

    if (!userDb) {
      res.json({
        data: null,
        lastSync: null,
        message: "No data found",
      });
      return;
    }

    res.json({
      data: userDb.data,
      lastSync: userDb.lastSync,
      dataHash: userDb.dataHash,
    });
  } catch (error) {
    console.error("Sync GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data, lastSync } = req.body;

    if (!data) {
      res.status(400).json({ error: "No data provided" });
      return;
    }

    const dataSize = getDataSize(data);
    if (dataSize > MAX_DATA_SIZE_BYTES) {
      res.status(413).json({
        error: `Data size (${formatBytes(dataSize)}) exceeds limit of ${formatBytes(MAX_DATA_SIZE_BYTES)}. Please reduce data before syncing.`,
      });
      return;
    }

    const db = await getDb();
    const userId = session.user.id;
    const dataHash = calculateDataHash(data);
    const now = new Date().toISOString();

    const existing = await db.collection("databases").findOne({ userId });

    if (existing) {
      const serverLastSync = existing.lastSync;

      if (lastSync && serverLastSync > lastSync) {
        res.json({
          conflict: true,
          serverData: existing.data,
          lastSync: serverLastSync,
          message: "Server has newer data",
        });
        return;
      }

      await db.collection("databases").updateOne(
        { userId },
        {
          $set: {
            data,
            lastSync: now,
            dataHash,
            dataSize,
            updatedAt: new Date(),
          },
        },
      );
    } else {
      await db.collection("databases").insertOne({
        userId,
        data,
        lastSync: now,
        dataHash,
        dataSize,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.json({
      success: true,
      lastSync: now,
      dataHash,
    });
  } catch (error) {
    console.error("Sync POST error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
