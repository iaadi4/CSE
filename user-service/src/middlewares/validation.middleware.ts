import Send from "../utils/response.utils";
import type { NextFunction, Request, Response } from "express";
import { type ZodType, ZodError } from "zod";

class ValidationMiddleware {
    static validateBody(schema: ZodType<any>) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const formattedErrors: Record<string, string[]> = {};

                    error.issues.forEach((err) => {
                        const field = err.path.join(".");
                        if (!formattedErrors[field]) {
                            formattedErrors[field] = [];
                        }
                        formattedErrors[field].push(err.message);
                    });

                    return Send.validationErrors(res, formattedErrors);
                }

                return Send.error(res, "Invalid request data");
            }
        };
    }
}

export default ValidationMiddleware;