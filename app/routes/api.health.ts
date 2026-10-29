import { getDb } from "../server/db.server";

export async function loader() {
    getDb().prepare("SELECT 1").get();
    return Response.json({ ok: true });
}
