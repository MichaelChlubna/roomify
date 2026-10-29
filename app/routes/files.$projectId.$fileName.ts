import type { Route } from "./+types/files.$projectId.$fileName";
import { getUser } from "../server/auth.server";
import { canView, getProject } from "../server/projects.server";
import { readProjectImage } from "../server/storage.server";

export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await getUser(request);
    const project = getProject(params.projectId);

    const isProjectFile = params.fileName === project?.source_file || params.fileName === project?.rendered_file;
    if (!project || !isProjectFile || !canView(project, user?.id)) return new Response("Not found", { status: 404 });

    const file = await readProjectImage(project.id, params.fileName);
    if (!file) return new Response("Not found", { status: 404 });

    return new Response(new Uint8Array(file.buffer), {
        headers: {
            "Content-Type": file.mimeType,
            "Cache-Control": project.is_public ? "public, max-age=31536000, immutable" : "private, max-age=31536000, immutable",
        },
    });
}
