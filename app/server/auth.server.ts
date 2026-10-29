import crypto from "node:crypto";
import { promisify } from "node:util";
import { createCookieSessionStorage } from "react-router";
import { getDb } from "./db.server";
import { getSessionSecret } from "./config.server";

const scrypt = promisify(crypto.scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>;

export type DbUser = {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    render_count: number;
    created_at: string;
};

export type PublicUser = { id: string; email: string; name: string };

const sessionStorage = createCookieSessionStorage<{ userId: string }>({
    cookie: {
        name: "roomify_session",
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.COOKIE_SECURE
            ? process.env.COOKIE_SECURE === "true"
            : process.env.NODE_ENV === "production",
        secrets: [getSessionSecret()],
        maxAge: 60 * 60 * 24 * 30,
    },
});

export const hashPassword = async (password: string) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, 64);
    return `${salt}:${hash.toString("hex")}`;
};

export const verifyPassword = async (password: string, stored: string) => {
    const [salt, hashHex] = stored.split(":");
    if (!salt || !hashHex) return false;

    const expected = Buffer.from(hashHex, "hex");
    const actual = await scrypt(password, salt, expected.length);

    return crypto.timingSafeEqual(expected, actual);
};

export const toPublicUser = (user: DbUser): PublicUser => ({
    id: user.id,
    email: user.email,
    name: user.name,
});

export const findUserByEmail = (email: string) =>
    getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as DbUser | undefined;

export const findUserById = (id: string) =>
    getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as DbUser | undefined;

export const createUser = async ({ email, name, password }: { email: string; name: string; password: string }) => {
    const user: DbUser = {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        name,
        password_hash: await hashPassword(password),
        render_count: 0,
        created_at: new Date().toISOString(),
    };

    getDb()
        .prepare("INSERT INTO users (id, email, name, password_hash, render_count, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(user.id, user.email, user.name, user.password_hash, user.render_count, user.created_at);

    return user;
};

export const getUser = async (request: Request) => {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    return userId ? findUserById(userId) ?? null : null;
};

export const requireUser = async (request: Request) => {
    const user = await getUser(request);
    if (!user) throw Response.json({ error: "Authentication required" }, { status: 401 });
    return user;
};

export const createUserSessionHeaders = async (request: Request, userId: string) => {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", userId);
    return { "Set-Cookie": await sessionStorage.commitSession(session) };
};

export const destroyUserSessionHeaders = async (request: Request) => {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    return { "Set-Cookie": await sessionStorage.destroySession(session) };
};
