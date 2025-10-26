import { config } from './config';
import { EthereumIndexer } from './indexer/ethereum/client';
import { SolanaIndexer } from './indexer/solana/client';
import { BitcoinIndexer } from './indexer/bitcoin/client';

export let watchList = new Set<string>();

async function main() {
  console.log('Configuration loaded successfully!');

  try {
    switch (config.chain_to_index) {
      case 'ethereum': {
        const ethIndexer = new EthereumIndexer();
        await ethIndexer.start(watchList);
        break;
      }
      case 'solana': {
        const solIndexer = new SolanaIndexer();
        await solIndexer.start(watchList);
        break;
      }
      case 'bitcoin': {
        const btcIndexer = new BitcoinIndexer();
        await btcIndexer.start(watchList);
        break;
      }
      default:
        throw new Error(`Unsupported chain: ${config.chain_to_index}`);
    }

    console.log(`\n✅ Indexer for ${config.chain_to_index.toUpperCase()} is running...`);

  } catch (error) {
    console.error('❌ Failed to run the indexer:', error);
    process.exit(1);
  }
}

main();