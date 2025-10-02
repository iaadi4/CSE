import { Router, type RequestHandler } from "express";

type RouteMethod = "get" | "post" | "put" | "delete" | "patch";

export interface RouteConfig {
    method: RouteMethod;
    path: string;
    handler: RequestHandler;
    middlewares?: RequestHandler[];
}

export default abstract class BaseRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.registerRoutes();
    }

    protected abstract routes(): RouteConfig[];
    protected abstract routes(): RouteConfig[];

    private registerRoutes(): void {
        this.routes().forEach(({ method, path, handler, middlewares = [] }) => {
            this.router[method](path, ...middlewares, handler);
        });
    }
}