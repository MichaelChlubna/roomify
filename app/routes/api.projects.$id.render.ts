import type { Route } from "./+types/api.projects.$id.render";
import { requireUser } from "../server/auth.server";
import { getProject, saveRender, toDesignItem } from "../server/projects.server";
import { readProjectImage } from "../server/storage.server";
import { renderImage } from "../server/ai.server";
import { buildRoomRedesignPrompt, findRoomStyle, MAX_ROOM_INSTRUCTIONS_LENGTH, ROOMIFY_RENDER_PROMPT } from "../../lib/constants";

export async function action({ request, params }: Route.ActionArgs) {
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    const user = await requireUser(request);
    const project = getProject(params.id);
    if (!project || project.owner_id !== user.id) return Response.json({ error: "Project not found" }, { status: 404 });

    // Room photos are restyled by the chosen style and/or a free-text request; floor plans need no options.
    let prompt = ROOMIFY_RENDER_PROMPT;
    let design: { style: string | null; instructions: string | null } | undefined;

    if (project.kind === "room") {
        const body = await request.json().catch(() => null);
        const style = findRoomStyle(body?.style)?.id ?? null;
        const instructions = String(body?.instructions ?? "").trim().slice(0, MAX_ROOM_INSTRUCTIONS_LENGTH) || null;

        if (!style && !instructions) {
            return Response.json({ error: "Vyberte styl nebo napište, co chcete změnit" }, { status: 400 });
        }

        prompt = buildRoomRedesignPrompt({ style, instructions });
        design = { style, instructions };
    }

    const source = await readProjectImage(project.id, project.source_file);
    if (!source) return Response.json({ error: "Source image is missing" }, { status: 500 });

    try {
        const rendered = await renderImage({ image: source.buffer, mimeType: source.mimeType, prompt });
        const updated = await saveRender(project, rendered.image, rendered.mimeType, design);

        return Response.json({ project: toDesignItem(updated) });
    } catch (e) {
        console.error("Render failed:", e);
        return Response.json({ error: "Vizualizaci se nepodařilo vytvořit. Zkuste to prosím později." }, { status: 502 });
    }
}
