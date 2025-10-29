import BitcoinCore from "bitcoin-core";
import { config } from "../../config";
import { saveTransaction } from "../../db";
import { Chain, Currency, TransactionStatus, TransactionType } from "../../generated/prisma/enums";

interface BitcoinTx {
  txid: string;
  vout: Array<{
    value: number;
    scriptPubKey: { address?: string };
  }>;
}

export class BitcoinIndexer {
  private client: BitcoinCore;
  private pollInterval: number = 10000;
  private lastProcessedHeight: bigint = 0n;
  constructor() {
    const rpcUrl = new URL(config.node.rpc_url_btc);

    this.client = new BitcoinCore({
      host: rpcUrl.host,
      username: config.node.rpc_user_btc,
      password: config.node.rpc_password_btc,
    });
    console.log("Stateful Bitcoin Indexer initialized.");
  }

  public async start(watchList: Set<string>) {
    console.log("Starting Bitcoin block processing...");
    this.pollForBlocks(watchList);
  }
  private async pollForBlocks(watchList: Set<string>): Promise<void> {
    try {
      const currentBlockHeight = BigInt(
        await this.client.command("getblockcount")
      );

      console.log(
        `Last processed block: ${this.lastProcessedHeight}, Current chain tip: ${currentBlockHeight}`
      );

      while (this.lastProcessedHeight < currentBlockHeight) {
        const nextHeight = this.lastProcessedHeight + 1n;
        console.log(`Processing block #${nextHeight}...`);

        const blockHash = await this.client.command(
          "getblockhash",
          Number(nextHeight)
        );
        // The second argument '2' is the verbosity level for getting full transaction details.
        const block = await this.client.command("getblock", blockHash, 2);

        for (const tx of block.tx as BitcoinTx[]) {
          for (const output of tx.vout) {
            if (
              output.scriptPubKey.address &&
              watchList.has(output.scriptPubKey.address)
            ) {
              console.log(`
                ----------------------------------------------------
                🚨 MATCH FOUND! Block: #${nextHeight}
                - To: ${output.scriptPubKey.address}
                - Amount: ${output.value} BTC
                - Hash: ${tx.txid}
                ----------------------------------------------------
              `);
              await saveTransaction({
                deposit_address: output.scriptPubKey.address,
                user_address: output.scriptPubKey.address,
                blockchain: Chain.bitcoin,
                currency: Currency.BTC,
                blockchain_hash: tx.txid,
                amount: output.value,
                status: TransactionStatus.pending,
                TransactionType: TransactionType.deposit,
                confirmations: 0,
              });
            }
          }
        }

        this.lastProcessedHeight = nextHeight;
      }
    } catch (error: unknown) {
      console.error("Error in Bitcoin polling loop:", error);
    } finally {
      setTimeout(() => this.pollForBlocks(watchList), this.pollInterval);
    }
  }
}
