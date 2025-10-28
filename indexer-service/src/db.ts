import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient();

const getDepositWallets = async () => {
    try {
        const wallets = await prisma.deposit_addresses.findMany();
        return wallets;
    } catch (error) {
        console.error("Error fetching deposit wallets:", error);
        throw error;
    }
}

export {
    getDepositWallets
};
