import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { config } from "../config";
import { deriveSolanaKeypair } from "../utils/keyDerivation.util";

const COLD_WALLET_SOL = config.COLD_WALLET_SOL;

export class SolanaSweeper {
  private connection: Connection;
  private coldWalletPubkey: PublicKey;
  private readonly MIN_SOL_RESERVE = 0.005 * LAMPORTS_PER_SOL;

  constructor() {
    this.connection = new Connection(
      config.node.rpc_url_sol.replace("wss", "https"),
      "confirmed"
    );
    this.coldWalletPubkey = new PublicKey(COLD_WALLET_SOL);
  }

  public async sweepWallet(userIndex: number) {
    const txHashes: string[] = [];
    let totalSweptSol = 0;

    const sweepKeypair = deriveSolanaKeypair(userIndex);
    const fromPubkey = sweepKeypair.publicKey;

    const balance = await this.connection.getBalance(fromPubkey);

    if (balance > this.MIN_SOL_RESERVE) {
      const { feeCalculator } = await this.connection.getRecentBlockhash();
      const estimatedFee = feeCalculator.lamportsPerSignature * 2;
      const totalCost = estimatedFee + this.MIN_SOL_RESERVE;

      if (balance > totalCost) {
        const sendableAmount = balance - totalCost;

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromPubkey,
            toPubkey: this.coldWalletPubkey,
            lamports: sendableAmount,
          })
        );

        try {
          const txHash = await sendAndConfirmTransaction(
            this.connection,
            transaction,
            [sweepKeypair]
          );
          txHashes.push(txHash);
          totalSweptSol = Number(sendableAmount) / LAMPORTS_PER_SOL;
        } catch (error) {
          console.error(`SOLANA SWEEP FAILED for native SOL:`, error);
        }
      }
    }

    return {
      txHashes,
      totalSweptSol,
    };
  }
}
