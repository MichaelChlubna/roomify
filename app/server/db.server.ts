import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DATA_DIR, DB_PATH } from "./config.server";

let db: DatabaseSync | null = null;

export const getDb = () => {
    if (db) return db;

    fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new DatabaseSync(DB_PATH);

    db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            render_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            source_file TEXT NOT NULL,
            rendered_file TEXT,
            is_public INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS projects_owner_idx ON projects(owner_id, created_at);
    `);

    // Columns added after the first release; older databases get them on startup.
    const projectColumns = (db.prepare("PRAGMA table_info(projects)").all() as { name: string }[]).map((c) => c.name);
    if (!projectColumns.includes("kind")) db.exec("ALTER TABLE projects ADD COLUMN kind TEXT NOT NULL DEFAULT 'floorplan'");
    if (!projectColumns.includes("style")) db.exec("ALTER TABLE projects ADD COLUMN style TEXT");
    if (!projectColumns.includes("instructions")) db.exec("ALTER TABLE projects ADD COLUMN instructions TEXT");

    return db;
};
