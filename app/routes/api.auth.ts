import type { Route } from "./+types/api.auth";
import {
    createUser,
    createUserSessionHeaders,
    destroyUserSessionHeaders,
    findUserByEmail,
    getUser,
    toPublicUser,
    verifyPassword,
} from "../server/auth.server";
import { ALLOW_REGISTRATION } from "../server/config.server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUser(request);
    return Response.json({ user: user ? toPublicUser(user) : null, allowRegistration: ALLOW_REGISTRATION });
}

export async function action({ request }: Route.ActionArgs) {
    const body = await request.json().catch(() => null);
    const intent = body?.intent;

    if (intent === "logout") {
        return Response.json({ user: null }, { headers: await destroyUserSessionHeaders(request) });
    }

    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!EMAIL_PATTERN.test(email) || !password) {
        return Response.json({ error: "Enter a valid email and password" }, { status: 400 });
    }

    if (intent === "register") {
        if (!ALLOW_REGISTRATION) return Response.json({ error: "Registration is disabled" }, { status: 403 });
        if (password.length < 8) return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        if (findUserByEmail(email)) return Response.json({ error: "An account with this email already exists" }, { status: 409 });

        const name = String(body?.name ?? "").trim() || email.split("@")[0];
        const user = await createUser({ email, name, password });

        return Response.json({ user: toPublicUser(user) }, { headers: await createUserSessionHeaders(request, user.id) });
    }

    if (intent === "login") {
        const user = findUserByEmail(email);
        if (!user || !(await verifyPassword(password, user.password_hash))) {
            return Response.json({ error: "Invalid email or password" }, { status: 401 });
        }

        return Response.json({ user: toPublicUser(user) }, { headers: await createUserSessionHeaders(request, user.id) });
    }

    return Response.json({ error: "Unknown intent" }, { status: 400 });
}
