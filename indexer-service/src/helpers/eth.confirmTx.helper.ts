import { ethers } from "ethers";
import { config } from "../config";
import { TransactionStatus } from "../enums/index.enum"
import { confirmTransaction, getEthereumPendingTransactions, updateTransactionConfirmations } from "../db";

const REQUIRED_CONFIRMATIONS = 12; 

export class ConfirmationWorker {
    private provider: ethers.JsonRpcProvider;
    private pollInterval = 60000; // 1 minute

    constructor() {
        this.provider = new ethers.JsonRpcProvider(config.node.rpc_url_eth.replace('wss', 'https'));
    }

    public start() {
        console.log('Confirmation Worker started.');
        this.pollTransactions();
        setInterval(() => this.pollTransactions(), this.pollInterval);
    }

    private async pollTransactions() {
        const pendingTxs = await getEthereumPendingTransactions();

        if (pendingTxs.length === 0) {
            return;
        }

        const currentBlock = await this.provider.getBlockNumber();
        console.log(`Checking ${pendingTxs.length} pending ETH transactions...`);

        for (const txRecord of pendingTxs) {
            try {
                const confirmations = currentBlock - txRecord.blockNumber;

                await updateTransactionConfirmations(txRecord.id, confirmations);

                if (confirmations >= REQUIRED_CONFIRMATIONS) {
                    const receipt = await this.provider.getTransactionReceipt(txRecord.blockchainHash);

                    if (receipt && receipt.status === 1) {
                        await confirmTransaction(
                            txRecord.id,
                            TransactionStatus.confirmed,
                        );
                        console.log(`✅ TX ${txRecord.blockchainHash} FINALIZED.`);
                    } else if (receipt && receipt.status === 0) {
                        await confirmTransaction(
                            txRecord.id,
                            TransactionStatus.failed,
                        );
                        console.log(`❌ TX ${txRecord.blockchainHash} FAILED.`);
                    }
                }
            } catch (error) {
                console.error(`Error confirming TX ${txRecord.blockchainHash}:`, error);
            }
        }
    }
}