import type { Route } from "./+types/api.projects";
import { requireUser } from "../server/auth.server";
import { createProject, listProjects, toDesignItem } from "../server/projects.server";
import { isSupportedImageType, parseDataUrl } from "../server/storage.server";
import { MAX_UPLOAD_BYTES } from "../server/config.server";
import { PROJECT_KINDS, type ProjectKind } from "../../lib/constants";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    return Response.json({ projects: listProjects(user.id).map(toDesignItem) });
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = typeof body?.sourceImage === "string" ? parseDataUrl(body.sourceImage) : null;

    if (!parsed || !isSupportedImageType(parsed.mimeType)) {
        return Response.json({ error: "Nahrajte obrázek ve formátu PNG, JPG nebo WebP" }, { status: 400 });
    }
    if (parsed.buffer.length > MAX_UPLOAD_BYTES) {
        return Response.json({ error: "Obrázek je příliš velký" }, { status: 413 });
    }

    const name = String(body?.name ?? "").trim().slice(0, 120) || "Projekt bez názvu";
    const kind: ProjectKind = PROJECT_KINDS.includes(body?.kind) ? body.kind : "floorplan";
    const project = await createProject({ ownerId: user.id, name, kind, source: parsed.buffer, mimeType: parsed.mimeType });

    return Response.json({ project: toDesignItem(project) }, { status: 201 });
}
