import * as z from 'zod';

const ethereumAddressSchema = z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format");

const bitcoinAddressSchema = z.string()
    .regex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/, "Invalid Bitcoin address format");

const solanaAddressSchema = z.string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{44}$/, "Invalid Solana address format");

const walletAddressSchema = z.string()
    .min(26, "Wallet address too short")
    .max(100, "Wallet address too long")
    .refine((address) => {
        // Ethereum/BSC/Polygon/EVM chains (0x + 40 hex chars)
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) return true;
        
        // Bitcoin legacy/P2SH (starts with 1 or 3)
        if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
        
        // Bitcoin bech32 (starts with bc1)
        if (/^bc1[a-z0-9]{39,59}$/.test(address)) return true;
        
        // Solana (base58, 44 chars)
        if (/^[1-9A-HJ-NP-Za-km-z]{44}$/.test(address)) return true;
        
        // Cardano
        if (/^addr1[a-z0-9]{98}$|^DdzFF[a-zA-Z0-9]{98}$/.test(address)) return true;
        
        // Polkadot/Kusama
        if (/^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address)) return true;
        
        // Avalanche (X/P chain)
        if (/^[XP]-[a-zA-Z0-9]{39}$/.test(address)) return true;
        
        // Cosmos
        if (/^cosmos1[a-z0-9]{38}$/.test(address)) return true;
        
        // Terra
        if (/^terra1[a-z0-9]{38}$/.test(address)) return true;
        
        // Litecoin
        if (/^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$|^ltc1[a-z0-9]{39,59}$/.test(address)) return true;
        
        // Dogecoin
        if (/^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/.test(address)) return true;
        
        // Ripple/XRP
        if (/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address)) return true;
        
        // Tron
        if (/^T[A-Za-z1-9]{33}$/.test(address)) return true;
        
        // Near Protocol
        if (/^[a-z0-9_.-]+\.near$|^[a-f0-9]{64}$/.test(address)) return true;
        
        // Algorand
        if (/^[A-Z2-7]{58}$/.test(address)) return true;
        
        // Monero
        if (/^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/.test(address)) return true;
        
        return false;
    }, {
        message: "Invalid wallet address format. Supported: Ethereum, Bitcoin, Solana, Cardano, Polkadot, Cosmos, Terra, Litecoin, Dogecoin, Ripple, Tron, Near, Algorand, Monero, and other EVM chains"
    });

const addWalletSchema = z.object({
    wallet_address: walletAddressSchema,
    is_active: z.boolean().optional().default(false)
});

const updateWalletSchema = z.object({
    is_active: z.boolean().optional()
});

const walletSchema = {
    walletAddress: walletAddressSchema,
    ethereumAddress: ethereumAddressSchema,
    bitcoinAddress: bitcoinAddressSchema,
    solanaAddress: solanaAddressSchema,
    addWallet: addWalletSchema,
    updateWallet: updateWalletSchema
};

export default walletSchema;