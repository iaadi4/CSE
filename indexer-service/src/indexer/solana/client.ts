import {
  Connection,
  LAMPORTS_PER_SOL,
  ParsedBlockResponse,
} from "@solana/web3.js";
import { config } from "../../config";

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
}
