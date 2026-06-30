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

function setNoCache(res: express.Response) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.removeHeader("ETag");
  res.set("Pragma", "no-cache");
}

// Lightweight status check — returns metadata without the full data payload
router.get("/status", async (req, res) => {
  let session: any = null;
  let userId: string | null = null;
  try {
    session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      setNoCache(res);
      res.status(401).json({ error: "Unauthorized", message: "Authentication required for sync status" });
      return;
    }

    userId = session.user.id;
    console.log("[Sync] GET /status for user", userId);

    const db = await getDb();
    const userDb = await db.collection("databases").findOne(
      { userId },
      { projection: { data: 0 } }, // Exclude the large data field
    );

    setNoCache(res);

    if (!userDb) {
      const resp = {
        hasData: false,
        lastSync: null,
        dataHash: null,
        dataSize: null,
        message: "No remote data found for this user",
      };
      console.log("[Sync] status response (no data)", { userId, ...resp });
      res.json(resp);
      return;
    }

    const resp = {
      hasData: true,
      lastSync: userDb.lastSync,
      dataHash: userDb.dataHash,
      dataSize: userDb.dataSize,
      message: "Remote data available",
    };
    console.log("[Sync] status response", { userId, hasData: true, lastSync: resp.lastSync, dataHash: resp.dataHash, dataSize: resp.dataSize });
    res.json(resp);
  } catch (error) {
    console.error("[Sync] status error:", error, { userId });
    setNoCache(res);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve sync status. See server logs." });
  }
});

router.get("/download", async (req, res) => {
  let session: any = null;
  let userId: string | null = null;
  try {
    session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      setNoCache(res);
      res.status(401).json({ error: "Unauthorized", message: "Authentication required to download data" });
      return;
    }

    userId = session.user.id;
    console.log("[Sync] GET /download for user", userId);

    const db = await getDb();
    const userDb = await db
      .collection("databases")
      .findOne({ userId });

    setNoCache(res);

    if (!userDb) {
      const resp = {
        data: null,
        lastSync: null,
        dataHash: null,
        message: "No data found on server",
      };
      console.log("[Sync] download response (no data)", { userId });
      res.json(resp);
      return;
    }

    const resp = {
      data: userDb.data,
      lastSync: userDb.lastSync,
      dataHash: userDb.dataHash,
      message: "Data downloaded successfully",
    };
    console.log("[Sync] download response", { userId, lastSync: resp.lastSync, dataHash: resp.dataHash });
    res.json(resp);
  } catch (error) {
    console.error("[Sync] GET /download error:", error, { userId });
    setNoCache(res);
    res.status(500).json({ error: "Internal server error", message: "Failed to download data. See server logs." });
  }
});

router.post("/upload", async (req, res) => {
  let session: any = null;
  let userId: string | null = null;
  try {
    session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      setNoCache(res);
      res.status(401).json({ error: "Unauthorized", message: "Authentication required to upload data" });
      return;
    }

    userId = session.user.id;
    const { data, lastSync } = req.body;

    console.log("[Sync] POST /upload for user", userId, { hasLastSync: !!lastSync });

    if (!data) {
      setNoCache(res);
      res.status(400).json({ error: "No data provided", message: "Request body must include 'data'" });
      return;
    }

    const dataSize = getDataSize(data);
    if (dataSize > MAX_DATA_SIZE_BYTES) {
      setNoCache(res);
      const errMsg = `Data size (${formatBytes(dataSize)}) exceeds limit of ${formatBytes(MAX_DATA_SIZE_BYTES)}. Please reduce data before syncing.`;
      res.status(413).json({ error: errMsg, message: errMsg });
      return;
    }

    const db = await getDb();
    const dataHash = calculateDataHash(data);
    const now = new Date().toISOString();

    const existing = await db.collection("databases").findOne({ userId });

    if (existing) {
      const serverLastSync = existing.lastSync;

      if (lastSync && serverLastSync > lastSync) {
        console.log("[Sync] upload conflict detected", { userId, clientLastSync: lastSync, serverLastSync });
        setNoCache(res);
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
      console.log("[Sync] upload updated", { userId, newLastSync: now, dataHash, dataSize: formatBytes(dataSize) });
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
      console.log("[Sync] upload inserted new", { userId, lastSync: now, dataHash, dataSize: formatBytes(dataSize) });
    }

    setNoCache(res);
    res.json({
      success: true,
      lastSync: now,
      dataHash,
      message: "Data uploaded successfully",
    });
  } catch (error) {
    console.error("[Sync] POST /upload error:", error, { userId });
    setNoCache(res);
    res.status(500).json({ error: "Internal server error", message: "Failed to upload data. See server logs." });
  }
});

export default router;
