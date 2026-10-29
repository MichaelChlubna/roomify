import path from "node:path";

export const DATA_DIR = path.resolve(process.env.DATA_DIR || "./data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
export const DB_PATH = path.join(DATA_DIR, "roomify.db");

// Max size of an uploaded floor plan, in bytes.
export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024;

export const ALLOW_REGISTRATION = (process.env.ALLOW_REGISTRATION ?? "true") !== "false";

export const getSessionSecret = () => {
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("SESSION_SECRET must be set in production");
        }
        return "dev-only-insecure-secret";
    }

    return secret;
};
