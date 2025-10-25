import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import { derivePath } from "ed25519-hd-key";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { Wallet } from "ethers";
import * as bitcoin from "bitcoinjs-lib";

const bip32 = BIP32Factory(ecc);
const MNEMONIC = process.env.MASTER_WALLET_MNEMONIC!;
const BTC_NETWORK = bitcoin.networks.bitcoin;

export const deriveSolanaAddress = (userIndex: number): string => {
  const seed = bip39.mnemonicToSeedSync(MNEMONIC);
  const path = `m/44'/501'/${userIndex}'/0'`;
  const derived = derivePath(path, seed.toString("hex")).key;
  const keypair = SolanaKeypair.fromSeed(derived);
  return keypair.publicKey.toBase58();
};

export const deriveEthereumAddress = (userIndex: number): string => {
  const path = `m/44'/60'/0'/0/${userIndex}`;
  const wallet = Wallet.fromPhrase(MNEMONIC).derivePath(path);
  return wallet.address;
};

export const deriveBitcoinAddress = (userIndex: number): string => {
  const seed = bip39.mnemonicToSeedSync(MNEMONIC);
  const root = bip32.fromSeed(seed, BTC_NETWORK);
  const path = `m/44'/0'/0'/0/${userIndex}`;
  const child = root.derivePath(path);
  const { address } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
    network: BTC_NETWORK,
  });
  return address!;
};
