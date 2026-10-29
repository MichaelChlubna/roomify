import type { Route } from "./+types/api.projects.$id";
import { getUser, requireUser } from "../server/auth.server";
import { canView, getProject, setVisibility, toDesignItem } from "../server/projects.server";

export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await getUser(request);
    const project = getProject(params.id);

    if (!project || !canView(project, user?.id)) return Response.json({ error: "Project not found" }, { status: 404 });

    return Response.json({ project: toDesignItem(project) });
}

export async function action({ request, params }: Route.ActionArgs) {
    if (request.method !== "PATCH") return Response.json({ error: "Method not allowed" }, { status: 405 });

    const user = await requireUser(request);
    const project = getProject(params.id);
    if (!project || project.owner_id !== user.id) return Response.json({ error: "Project not found" }, { status: 404 });

    const body = await request.json().catch(() => null);
    if (typeof body?.isPublic !== "boolean") return Response.json({ error: "isPublic must be a boolean" }, { status: 400 });

    return Response.json({ project: toDesignItem(setVisibility(project.id, body.isPublic)) });
}
