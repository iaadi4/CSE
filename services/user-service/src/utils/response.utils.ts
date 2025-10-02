import type { Response } from "express";

class Send {
    static success(res: Response, data: any, message = "success") {
        res.status(200).json({
            ok: true,
            message,
            data
        });
        return;
    }

    static error(res: Response, data: any, message = "error") {
        res.status(500).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    static notFound(res: Response, data: any, message = "not found") {
        res.status(404).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    static unauthorized(res: Response, data: any, message = "unauthorized") {
        res.status(401).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    static validationErrors(res: Response, errors: Record<string, string[]>) {
        res.status(422).json({
            ok: false,
            message: "Validation error",
            errors,
        });
        return;
    }

    static forbidden(res: Response, data: any, message = "forbidden") {
        res.status(403).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    static badRequest(res: Response, data: any, message = "bad request") {
        res.status(400).json({
            ok: false,
            message,
            data,
        });
        return;
    }
}

export default Send;