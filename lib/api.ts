export type ApiUser = { id: string; email: string; name: string };

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
        credentials: "same-origin",
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.error || `Požadavek selhal (${response.status})`);
    }

    return data as T;
};

export const getCurrentUser = async () => {
    try {
        const { user } = await request<{ user: ApiUser | null }>("/api/auth");
        return user;
    } catch {
        return null;
    }
}

export const signIn = ({ email, password }: { email: string; password: string }) =>
    request<{ user: ApiUser }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({ intent: "login", email, password }),
    });

export const register = ({ name, email, password }: { name: string; email: string; password: string }) =>
    request<{ user: ApiUser }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({ intent: "register", name, email, password }),
    });

export const signOut = () =>
    request("/api/auth", { method: "POST", body: JSON.stringify({ intent: "logout" }) });

export const createProject = async ({ name, sourceImage }: { name: string; sourceImage: string }) => {
    try {
        const { project } = await request<{ project: DesignItem }>("/api/projects", {
            method: "POST",
            body: JSON.stringify({ name, sourceImage }),
        });
        return project;
    } catch (e) {
        console.error("Failed to create project", e);
        return null;
    }
}

export const getProjects = async () => {
    try {
        const { projects } = await request<{ projects: DesignItem[] }>("/api/projects");
        return projects;
    } catch (e) {
        console.error("Failed to get projects", e);
        return [];
    }
}

export const getProjectById = async ({ id }: { id: string }) => {
    try {
        const { project } = await request<{ project: DesignItem }>(`/api/projects/${encodeURIComponent(id)}`);
        return project;
    } catch (e) {
        console.error("Failed to fetch project", e);
        return null;
    }
};

// Runs the AI render on the server and returns the updated project.
export const renderProject = async ({ id }: { id: string }) => {
    const { project } = await request<{ project: DesignItem }>(`/api/projects/${encodeURIComponent(id)}/render`, {
        method: "POST",
    });
    return project;
};
