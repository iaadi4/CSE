import Send from "../utils/response.utils";
import { prisma } from "../db.js";
import type { Request, Response } from "express";

class BalanceController {
    // Helper method to get user ID from either JWT or service header
    private static getUserId(req: Request): number | null {
        // Check for service API key first (for inter-service calls)
        const serviceKey = req.headers['x-service-key'];
        if (serviceKey === process.env.SERVICE_API_KEY) {
            const userId = req.headers['x-user-id'];
            return userId ? parseInt(userId as string) : null;
        }
        
        // Otherwise use JWT user ID (convert string to number)
        const jwtUserId = (req as any).userId;
        return jwtUserId ? parseInt(jwtUserId) : null;
    }

    // Get user balances for all currencies
    static getBalances = async (req: Request, res: Response) => {
        try {
            const userId = BalanceController.getUserId(req);
            if (!userId) {
                return Send.unauthorized(res, { message: "Invalid authentication" });
            }

            const balances = await prisma.user_balances.findMany({
                where: { user_id: userId },
                select: {
                    currency: true,
                    balance: true,
                    locked_balance: true,
                }
            });

            // Format balances by currency
            const formattedBalances: { [key: string]: { available: number; locked: number } } = {};
            balances.forEach(balance => {
                formattedBalances[balance.currency] = {
                    available: parseFloat(balance.balance.toString()) - parseFloat(balance.locked_balance.toString()),
                    locked: parseFloat(balance.locked_balance.toString())
                };
            });

            return Send.success(res, { balances: formattedBalances });
        } catch (error) {
            console.error("Error fetching balances:", error);
            return Send.error(res, {}, "Internal server error");
        }
    };

    // Get balance for specific currency
    static getBalance = async (req: Request, res: Response) => {
        try {
            const userId = BalanceController.getUserId(req);
            if (!userId) {
                return Send.unauthorized(res, { message: "Invalid authentication" });
            }
            
            const { currency } = req.params;

            const balance = await prisma.user_balances.findUnique({
                where: {
                    user_id_currency: {
                        user_id: userId,
                        currency: currency as any
                    }
                },
                select: {
                    balance: true,
                    locked_balance: true,
                }
            });

            if (!balance) {
                // Return zero balance if no record exists for this currency
                return Send.success(res, {
                    currency,
                    available: 0,
                    locked: 0,
                    total: 0
                });
            }

            const available = parseFloat(balance.balance.toString()) - parseFloat(balance.locked_balance.toString());
            const locked = parseFloat(balance.locked_balance.toString());

            return Send.success(res, {
                currency,
                available,
                locked,
                total: available + locked
            });
        } catch (error) {
            console.error("Error fetching balance:", error);
            return Send.error(res, {}, "Internal server error");
        }
    };

    // Lock funds (for order placement)
    static lockFunds = async (req: Request, res: Response) => {
        try {
            const userId = BalanceController.getUserId(req);
            if (!userId) {
                return Send.unauthorized(res, { message: "Invalid authentication" });
            }
            
            const { currency, amount } = req.body;

            if (!currency || !amount) {
                return Send.badRequest(res, {}, "Currency and amount are required");
            }

            const lockAmount = parseFloat(amount);
            if (lockAmount <= 0) {
                return Send.badRequest(res, {}, "Amount must be positive");
            }

            // Check if user has sufficient balance
            const balance = await prisma.user_balances.findUnique({
                where: {
                    user_id_currency: {
                        user_id: userId,
                        currency: currency as any
                    }
                }
            });

            if (!balance) {
                return Send.notFound(res, {}, "Balance not found");
            }

            const availableBalance = parseFloat(balance.balance.toString()) - parseFloat(balance.locked_balance.toString());
            if (availableBalance < lockAmount) {
                return Send.badRequest(res, {}, "Insufficient funds");
            }

            // Lock the funds
            await prisma.user_balances.update({
                where: {
                    user_id_currency: {
                        user_id: userId,
                        currency: currency as any
                    }
                },
                data: {
                    locked_balance: {
                        increment: lockAmount
                    }
                }
            });

            return Send.success(res, { message: "Funds locked successfully" });
        } catch (error) {
            console.error("Error locking funds:", error);
            return Send.error(res, {}, "Internal server error");
        }
    };

    // Unlock funds (for order cancellation)
    static unlockFunds = async (req: Request, res: Response) => {
        try {
            const userId = BalanceController.getUserId(req);
            if (!userId) {
                return Send.unauthorized(res, { message: "Invalid authentication" });
            }
            
            const { currency, amount } = req.body;

            if (!currency || !amount) {
                return Send.badRequest(res, {}, "Currency and amount are required");
            }

            const unlockAmount = parseFloat(amount);
            if (unlockAmount <= 0) {
                return Send.badRequest(res, {}, "Amount must be positive");
            }

            // Check if user has sufficient locked balance
            const balance = await prisma.user_balances.findUnique({
                where: {
                    user_id_currency: {
                        user_id: userId,
                        currency: currency as any
                    }
                }
            });

            if (!balance) {
                return Send.notFound(res, {}, "Balance not found");
            }

            const lockedBalance = parseFloat(balance.locked_balance.toString());
            if (lockedBalance < unlockAmount) {
                return Send.badRequest(res, {}, "Insufficient locked funds");
            }

            // Unlock the funds
            await prisma.user_balances.update({
                where: {
                    user_id_currency: {
                        user_id: userId,
                        currency: currency as any
                    }
                },
                data: {
                    locked_balance: {
                        decrement: unlockAmount
                    }
                }
            });

            return Send.success(res, { message: "Funds unlocked successfully" });
        } catch (error) {
            console.error("Error unlocking funds:", error);
            return Send.error(res, {}, "Internal server error");
        }
    };

    // Update balance (for trade settlements)
    static updateBalance = async (req: Request, res: Response) => {
        try {
            const userId = BalanceController.getUserId(req);
            if (!userId) {
                return Send.unauthorized(res, { message: "Invalid authentication" });
            }
            
            const { currency, amount, operation } = req.body;

            if (!currency || !amount || !operation) {
                return Send.badRequest(res, {}, "Currency, amount, and operation are required");
            }

            if (!['add', 'subtract'].includes(operation)) {
                return Send.badRequest(res, {}, "Operation must be 'add' or 'subtract'");
            }

            const updateAmount = parseFloat(amount);
            if (updateAmount <= 0) {
                return Send.badRequest(res, {}, "Amount must be positive");
            }

            const updateData = operation === 'add'
                ? { balance: { increment: updateAmount } }
                : { balance: { decrement: updateAmount } };

            await prisma.user_balances.upsert({
                where: {
                    user_id_currency: {
                        user_id: userId,
                        currency: currency as any
                    }
                },
                update: updateData,
                create: {
                    user_id: userId,
                    currency: currency as any,
                    balance: operation === 'add' ? updateAmount : -updateAmount,
                    locked_balance: 0
                }
            });

            return Send.success(res, { message: `Balance ${operation}ed successfully` });
        } catch (error) {
            console.error("Error updating balance:", error);
            return Send.error(res, {}, "Internal server error");
        }
    };
}

export default BalanceController;