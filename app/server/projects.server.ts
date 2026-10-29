import crypto from "node:crypto";
import { getDb } from "./db.server";
import { saveProjectImage } from "./storage.server";

type DbProject = {
    id: string;
    owner_id: string;
    name: string;
    source_file: string;
    rendered_file: string | null;
    is_public: number;
    created_at: string;
    updated_at: string;
};

const fileUrl = (projectId: string, fileName: string, version: string) =>
    `/files/${projectId}/${fileName}?v=${encodeURIComponent(version)}`;

export const toDesignItem = (project: DbProject): DesignItem => ({
    id: project.id,
    name: project.name,
    sourceImage: fileUrl(project.id, project.source_file, project.created_at),
    renderedImage: project.rendered_file ? fileUrl(project.id, project.rendered_file, project.updated_at) : null,
    timestamp: new Date(project.updated_at).getTime(),
    ownerId: project.owner_id,
    isPublic: !!project.is_public,
});

export const getProject = (id: string) =>
    getDb().prepare("SELECT * FROM projects WHERE id = ?").get(id) as DbProject | undefined;

export const canView = (project: DbProject, userId: string | null | undefined) =>
    !!project.is_public || project.owner_id === userId;

export const listProjects = (ownerId: string) =>
    getDb()
        .prepare("SELECT * FROM projects WHERE owner_id = ? ORDER BY updated_at DESC")
        .all(ownerId) as DbProject[];

export const createProject = async ({ ownerId, name, source, mimeType }: { ownerId: string; name: string; source: Buffer; mimeType: string }) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const sourceFile = await saveProjectImage(id, "source", source, mimeType);

    getDb()
        .prepare("INSERT INTO projects (id, owner_id, name, source_file, rendered_file, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, 0, ?, ?)")
        .run(id, ownerId, name, sourceFile, now, now);

    return getProject(id)!;
};

export const saveRender = async (project: DbProject, image: Buffer, mimeType: string) => {
    const renderedFile = await saveProjectImage(project.id, "rendered", image, mimeType);
    const db = getDb();

    db.prepare("UPDATE projects SET rendered_file = ?, updated_at = ? WHERE id = ?")
        .run(renderedFile, new Date().toISOString(), project.id);
    db.prepare("UPDATE users SET render_count = render_count + 1 WHERE id = ?").run(project.owner_id);

    return getProject(project.id)!;
};

export const setVisibility = (projectId: string, isPublic: boolean) => {
    getDb().prepare("UPDATE projects SET is_public = ? WHERE id = ?").run(isPublic ? 1 : 0, projectId);
    return getProject(projectId)!;
};
