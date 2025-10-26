import { config } from './config';
import { EthereumIndexer } from './indexer/ethereum/client';
import { SolanaIndexer } from './indexer/solana/client';

export let watchList = new Set<string>();

async function main() {
  console.log('Configuration loaded successfully!');

  try {
    if (config.chain_to_index === 'ethereum') {
      const ethIndexer = new EthereumIndexer();
      ethIndexer.start(watchList);
    } else if(config.chain_to_index === 'solana') {
      const solIndexer = new SolanaIndexer();
      solIndexer.start(watchList);
    } else {
      throw new Error(`Indexer for chain "${config.chain_to_index}" is not implemented.`);
    }

    console.log(`\n✅ Indexer for ${config.chain_to_index.toUpperCase()} is running...`);

  } catch (error) {
    console.error('❌ Failed to run the indexer:', error);
    process.exit(1);
  }
}

main();