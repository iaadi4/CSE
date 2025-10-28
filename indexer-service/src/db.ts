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
};

const saveTransaction = async (data: any) => {
  try {
    const { deposit_address } = data;

    const depositAddress = await prisma.deposit_addresses.findUnique({
      where: {
        address: deposit_address,
      },
    });

    const userId = depositAddress.user_id;

    const transaction = await prisma.transactions.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
    return transaction;
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw error;
  }
};

export { getDepositWallets, saveTransaction };
