import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('login', './routes/login.tsx'),
    route('visualizer/:id', './routes/visualizer.$id.tsx'),

    route('api/health', './routes/api.health.ts'),
    route('api/auth', './routes/api.auth.ts'),
    route('api/projects', './routes/api.projects.ts'),
    route('api/projects/:id', './routes/api.projects.$id.ts'),
    route('api/projects/:id/render', './routes/api.projects.$id.render.ts'),
    route('files/:projectId/:fileName', './routes/files.$projectId.$fileName.ts'),
] satisfies RouteConfig;
