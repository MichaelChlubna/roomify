import type { Route } from "./+types/api.projects.$id.render";
import { requireUser } from "../server/auth.server";
import { getProject, saveRender, toDesignItem } from "../server/projects.server";
import { readProjectImage } from "../server/storage.server";
import { renderFloorPlan } from "../server/ai.server";

export async function action({ request, params }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    const user = await requireUser(request);
    const project = getProject(params.id);
    if (!project || project.owner_id !== user.id) return Response.json({ error: "Project not found" }, { status: 404 });

    const source = await readProjectImage(project.id, project.source_file);
    if (!source) return Response.json({ error: "Source image is missing" }, { status: 500 });

    try {
        const rendered = await renderFloorPlan({ image: source.buffer, mimeType: source.mimeType });
        const updated = await saveRender(project, rendered.image, rendered.mimeType);

        return Response.json({ project: toDesignItem(updated) });
    } catch (e) {
        console.error("Render failed:", e);
        return Response.json({ error: "Rendering failed" }, { status: 502 });
    }
}
