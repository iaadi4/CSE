import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Cluster,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
} from "@solana/spl-token";
const TOKEN_DECIMALS = 9;
const SOLANA_NETWORK: Cluster = (process.env.SOLANA_NETWORK as Cluster) || "devnet";

const getAdminKeypair = (): Keypair => {
  const secretKeyEnv = process.env.ADMIN_SECRET_KEY;
  if (!secretKeyEnv) {
    throw new Error(
      "ADMIN_SECRET_KEY environment variable is not set. Please set it to your wallet's secret key (stringified byte array)."
    );
  }

  try {
    const secretKeyBytes = Uint8Array.from(JSON.parse(secretKeyEnv));
    return Keypair.fromSecretKey(secretKeyBytes);
  } catch (error) {
    console.error("Failed to parse ADMIN_SECRET_KEY:", error);
    throw new Error(
      "Invalid ADMIN_SECRET_KEY format. Must be a stringified byte array."
    );
  }
};

export interface TokenCreationParams {
  name: string; 
  symbol: string;
  supply: number;
}

export const createSolanaToken = async (
  params: TokenCreationParams,
  creatorWalletAddress: string
): Promise<string> => {
  try {
    const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), "confirmed");
    const adminKeypair = getAdminKeypair();
    console.log(
      `Admin wallet loaded: ${adminKeypair.publicKey.toBase58()}`
    );

    let creatorPublicKey: PublicKey;
    try {
      creatorPublicKey = new PublicKey(creatorWalletAddress);
    } catch (err) {
      throw new Error("Invalid creatorWalletAddress provided.");
    }

    if (SOLANA_NETWORK === "devnet") {
      console.log("Requesting devnet SOL airdrop...");
      const airdropSignature = await connection.requestAirdrop(
        adminKeypair.publicKey,
        1 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature, "confirmed");
      console.log("Airdrop confirmed.");
    }

    console.log("Creating new token mint...");
    const mint = await createMint(
      connection,
      adminKeypair, // Payer
      adminKeypair.publicKey, // Mint Authority
      adminKeypair.publicKey, // Freeze Authority
      TOKEN_DECIMALS // Decimals
    );
    console.log(`Token Mint created: ${mint.toBase58()}`);

    // Creator's Associated Token Account (ATA)
    // This is the account that will hold the creator's supply of the new token.
    console.log(`Getting/creating token account for creator...`);
    const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair, // Payer
      mint, // Mint public key
      creatorPublicKey // Owner of this token account
    );
    console.log(
      `Creator Token Account: ${creatorTokenAccount.address.toBase58()}`
    );

    // Mint initial supply to the creator's token account
    console.log(`Minting initial supply of ${params.supply} tokens...`);
    // Adjust supply for decimals
    const mintAmount = BigInt(params.supply) * BigInt(10 ** TOKEN_DECIMALS);

    await mintTo(
      connection,
      adminKeypair, // Payer
      mint, // The token mint
      creatorTokenAccount.address, // Destination account
      adminKeypair.publicKey, // Mint Authority
      mintAmount // Amount (with decimals)
    );
    console.log("Initial supply minted successfully.");

    // Disable future minting by setting the mint authority to null
    console.log("Disabling future minting...");
    await setAuthority(
      connection,
      adminKeypair, // Payer
      mint, // Mint
      adminKeypair.publicKey, // Current Mint Authority
      AuthorityType.MintTokens, // Authority type to change
      null // New authority (null = disabled)
    );
    console.log("Mint authority disabled. Token is now fixed-supply.");

    // mint address
    return mint.toBase58();
  } catch (error) {
    console.error("Solana Token Creation Failed:", error);
    throw new Error(`Solana token creation failed: ${error}`);
  }
};

