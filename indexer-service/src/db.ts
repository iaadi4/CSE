import { Chain, TransactionStatus, PrismaClient } from "./generated/prisma/client";

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

const getEthereumPendingTransactions = async () => {
  try {
    const transactions = await prisma.transactions.findMany({
      where: {
        status: TransactionStatus.pending,
        chain: Chain.ethereum,
      },
    });
    return transactions;
  } catch (error) {
    console.error("Error fetching pending Ethereum transactions:", error);
    throw error;
  }
};

const updateTransactionConfirmations = async (transactionId: string, confirmations: number) => {
  try {
    await prisma.transactions.update({
      where: {
        id: transactionId
      },
      data: {
        confirmations
      },
    });
  } catch (error) {
    console.error(`Error updating confirmations for transaction ID ${transactionId}:`, error);
    throw error;
  }
}

const confirmTransaction = async (transactionId: string, status: TransactionStatus) => {
  try {
    await prisma.transactions.update({
      where: {
        id: transactionId
      },
      data: {
        status: status
      },
    });
  } catch (error) {
    console.error(`Error confirming transaction ID ${transactionId}:`, error);
    throw error;
  }
}

export {
  getDepositWallets,
  saveTransaction,
  getEthereumPendingTransactions,
  updateTransactionConfirmations,
  confirmTransaction
};
