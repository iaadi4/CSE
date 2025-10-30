import { Currency } from "./generated/prisma";
import { PrismaClient, Chain } from "./generated/prisma/client";

const prisma = new PrismaClient();

const getAddressToSweep = async(chain: Chain, currency: Currency, minBalance: number) => {
    try {
        const address = await prisma.deposit_addresses.findMany({
            where: {
                chain,
                is_active: true,
                users: {
                    user_balances: {
                        some: {
                            currency,
                            balance: {
                                gte: minBalance // users with balance >= minBalance
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                address: true,
                user_id: true
            }
        });

        return address;
    } catch (error) {
        console.error(`Error while fetching deposit address to sweep from ${chain}`, error);
    }
}

export {
    getAddressToSweep
}