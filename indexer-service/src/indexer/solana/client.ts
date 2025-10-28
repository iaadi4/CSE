import {
  Connection,
  LAMPORTS_PER_SOL,
  ParsedBlockResponse,
} from "@solana/web3.js";
import { config } from "../../config";
import { saveTransaction } from "../../db";
import {
  Chain,
  TransactionStatus,
  Currency,
  TransactionType,
} from "../../enums/index.enum";
import { updateTransactionConfirmations } from "../../helpers/solana.confirmTx.helper";

export class SolanaIndexer {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(config.node.rpc_url_sol);
    console.log("Solana indexer initialized!");
  }

  public async start(watchList: Set<string>) {
    console.log("Starting solana slot listener...");

    this.connection.onRootChange(async (slot) => {
      console.log(`New solana Root (Confirmed slot): ${slot}`);

      try {
        const block = (await this.connection.getParsedBlock(slot, {
          maxSupportedTransactionVersion: 0,
          transactionDetails: "full",
        })) as unknown as ParsedBlockResponse;

        if (block) {
          for (const tx of block.transactions) {
            const message = tx.transaction.message;

            for (const inst of message.instructions) {
              const parsedInstruction = inst as any;

              if (
                parsedInstruction.program === "system" &&
                parsedInstruction.parsed?.type === "transfer"
              ) {
                const toAddress = parsedInstruction.parsed.info.destination;
                const fromAddress = parsedInstruction.parsed.info.source;

                if (watchList.has(toAddress)) {
                  const lamports = parsedInstruction.parsed.info.lamports;

                  console.log(`
                    ----------------------------------------------------
                    🚨 MATCH FOUND! Processing transaction...
                    - To: ${toAddress}
                    - Amount: ${lamports / LAMPORTS_PER_SOL} SOL
                    - Signature: ${tx.transaction.signatures[0]}
                    ----------------------------------------------------
                  `);

                  await saveTransaction({
                    deposit_address: toAddress,
                    user_address: toAddress,
                    amount: lamports / LAMPORTS_PER_SOL,
                    currency: Currency.SOL,
                    chain: Chain.solana,
                    blockchain_hash: tx.transaction.signatures[0],
                    status: TransactionStatus.pending,
                    transactionType: TransactionType.deposit,
                    confirmations: 0,
                  });

                  this.trackConfirmations(tx.transaction.signatures[0]);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing slot #${slot}`, error);
      }
    });
  }

  private async trackConfirmations(signature: string) {
    let retries = 0;
    while (retries < 10) {
      const status = await this.connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });

      const confirmationStatus = status.value?.confirmationStatus;

      if (confirmationStatus === "finalized") {
        await updateTransactionConfirmations(
          signature,
          32,
          TransactionStatus.confirmed
        );
        console.log(`✅ Tx finalized: ${signature}`);
        return;
      } else if (confirmationStatus === "confirmed") {
        await updateTransactionConfirmations(
          signature,
          8,
          TransactionStatus.pending
        );
        console.log(`⏳ Tx confirmed (not yet finalized): ${signature}`);
      } else if (confirmationStatus === "processed") {
        await updateTransactionConfirmations(
          signature,
          1,
          TransactionStatus.pending
        );
      }

      await new Promise((r) => setTimeout(r, 5000));
      retries++;
    }

    console.warn(`⚠️ Tx not finalized after 10 retries: ${signature}`);
  }
}
