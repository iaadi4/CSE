import { PrismaClient } from "../generated/prisma/client";
import { TransactionStatus } from "../enums/index.enum";

const prisma = new PrismaClient();

export async function updateTransactionConfirmations(hash: string, confirmations: number, status: TransactionStatus) {
  return prisma.transactions.updateMany({
    where: {
      blockchain_hash: hash
    },
    data: {
      confirmations,
      status
    }
  });
}
