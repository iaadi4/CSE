import { Keypair as SolanaKeypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';

const MNEMONIC = process.env.MASTER_WALLET_MNEMONIC!; 

const SOLANA_BASE_PATH = "m/44'/501'";

export function deriveSolanaKeypair(userIndex: number): SolanaKeypair {
    const seed = bip39.mnemonicToSeedSync(MNEMONIC);
    const hd = HDKey.fromMasterSeed(seed);

    const fullPath = `${SOLANA_BASE_PATH}/${userIndex}'/0'`; 

    const key = hd.derive(fullPath);

    if (!key.privateKey) {
        throw new Error(`Failed to derive private key for path ${fullPath}`);
    }
    
    return SolanaKeypair.fromSeed(key.privateKey.subarray(0, 32));
}