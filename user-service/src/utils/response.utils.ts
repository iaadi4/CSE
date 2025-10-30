import type { Response } from "express";
import { StatusCode } from "./statusCodes.utils";

class Send {
    static success(res: Response, data: any, message = "success") {
        res.status(StatusCode.OK).json({
            ok: true,
            message,
            data
        });
        return;
    }

    static error(res: Response, data: any, message = "error") {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    static notFound(res: Response, data: any, message = "not found") {
        res.status(StatusCode.NOT_FOUND).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    static unauthorized(res: Response, data: any, message = "unauthorized") {
        res.status(StatusCode.UNAUTHORIZED).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    static validationErrors(res: Response, errors: Record<string, string[]>) {
        res.status(StatusCode.UNAUTHORIZED).json({
            ok: false,
            message: "Validation error",
            errors,
        });
        return;
    }

    static forbidden(res: Response, data: any, message = "forbidden") {
        res.status(StatusCode.FORBIDDEN).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    static badRequest(res: Response, data: any, message = "bad request") {
        res.status(StatusCode.BAD_REQUEST).json({
            ok: false,
            message,
            data,
        });
        return;
    }
}

export default Send;