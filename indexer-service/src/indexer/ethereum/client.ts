import { ethers } from 'ethers';
import { config } from '../../config';
import { saveTransaction } from '../../db';
import { Chain, TransactionStatus, TransactionType } from '../../enums/index.enum';

export class EthereumIndexer {
  private provider: ethers.WebSocketProvider;

  constructor() {
    this.provider = new ethers.WebSocketProvider(config.node.rpc_url_eth);
    console.log('Ethereum Indexer initialized.');
  }

  public async start(watchList: Set<string>) {
    console.log('Starting Ethereum block listener...');

    this.provider.on('block', async (blockNumber: number) => {
      console.log(`New Ethereum Block Detected: #${blockNumber}`);
      try {
        const block = await this.provider.getBlock(blockNumber, true);

        if (block) {
          for (const tx of block.prefetchedTransactions) {
            if (tx.to && watchList.has(tx.to.toLowerCase())) {
              console.log(`
                ----------------------------------------------------
                🚨 MATCH FOUND! Processing transaction...
                - To: ${tx.to}
                - Amount: ${ethers.formatEther(tx.value)} ETH
                - Hash: ${tx.hash}
                ----------------------------------------------------
              `);
              await saveTransaction({
                to: tx.to,
                from: tx.from,
                amount: ethers.formatEther(tx.value),
                hash: tx.hash,
                blockNumber: block.number,
                chain: Chain.ethereum,
                status: TransactionStatus.pending,
                transactionType: TransactionType.deposit,
                confiramations: 0,
              })
            }
          }
        }
      } catch (error) {
        console.error(`Error processing block #${blockNumber}:`, error);
      }
    });

    this.provider.on('error', (error) => {
      console.error('WebSocket Provider Error. Reconnecting...', error);
      this.reconnect();
    });
  }

  private reconnect() {
    console.log('Attempting to reconnect WebSocket...');
    this.provider.removeAllListeners();
    this.provider = new ethers.WebSocketProvider(config.node.rpc_url_eth);
  }
}