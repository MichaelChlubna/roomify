import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "./config.server";

const MIME_TO_EXT: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

const EXT_TO_MIME: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
};

export const isSupportedImageType = (mimeType: string) => mimeType in MIME_TO_EXT;

export const parseDataUrl = (dataUrl: string) => {
    const match = dataUrl.match(/^data:([^;,]+);base64,([\s\S]*)$/);
    if (!match) return null;

    return { mimeType: match[1].toLowerCase(), buffer: Buffer.from(match[2], "base64") };
};

const projectDir = (projectId: string) => path.join(UPLOADS_DIR, projectId);

// Files are stored as <uploads>/<projectId>/<label>.<ext>; only that bare name is kept in the DB.
export const saveProjectImage = async (projectId: string, label: "source" | "rendered", buffer: Buffer, mimeType: string) => {
    const ext = MIME_TO_EXT[mimeType];
    if (!ext) throw new Error(`Unsupported image type: ${mimeType}`);

    const dir = projectDir(projectId);
    await fs.mkdir(dir, { recursive: true });

    const fileName = `${label}.${ext}`;
    await fs.writeFile(path.join(dir, fileName), buffer);

    return fileName;
};

export const readProjectImage = async (projectId: string, fileName: string) => {
    const safeName = path.basename(fileName);
    const ext = safeName.split(".").pop() ?? "";
    const mimeType = EXT_TO_MIME[ext];
    if (!mimeType) return null;

    try {
        const buffer = await fs.readFile(path.join(projectDir(path.basename(projectId)), safeName));
        return { buffer, mimeType };
    } catch {
        return null;
    }
};

export const deleteProjectImages = (projectId: string) =>
    fs.rm(projectDir(path.basename(projectId)), { recursive: true, force: true });
