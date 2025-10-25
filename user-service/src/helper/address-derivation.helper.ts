import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);
import { derivePath } from "ed25519-hd-key";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { Wallet } from "ethers";
import * as bitcoin from "bitcoinjs-lib";

const MNEMONIC = process.env.MASTER_WALLET_MNEMONIC!; // master seed

export const deriveSolanaAddress = (userIndex: number) => {
    const seed = bip39.mnemonicToSeedSync(MNEMONIC);
    const path = `m/44'/501'/${userIndex}'/0'`;
    const deriveSeed = derivePath(path, seed.toString("hex")).key;
    return SolanaKeypair.fromSeed(deriveSeed);
}

export const deriveEthereumAddress = (userIndex: number) => {
    const path = `m/44'/60'/0'/0/${userIndex}`;
    const wallet = Wallet.fromPhrase(MNEMONIC).derivePath(path);
    return wallet;
}

export const deriveBitcoinAddress = (userIndex: number) => {
    const seed = bip39.mnemonicToSeedSync(MNEMONIC);
    const root = bip32.fromSeed(seed);
    const path = `m/44'/0'/0'/0/${userIndex}`;
    const child = root.derivePath(path);
    const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });
    return { address, keyPair: child };
}