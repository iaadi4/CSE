import Send from "../utils/response.utils";
import { prisma } from "../db";
import type { Request, Response } from "express";
import { deriveBitcoinAddress, deriveEthereumAddress, deriveSolanaAddress } from "../helper/address-derivation.helper";

class WalletController {
  static createDepositAddress = async(req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { chain, currency } = req.body;

      const depositAddress = await prisma.deposit_addresses.findFirst({
        where: {
          user_id: Number(userId),
          chain,
          currency
        }
      })

      if (depositAddress?.address) {
        return Send.success(res, { address: depositAddress.address });
      }

      let derivedAddress: string | undefined;
      if(chain == "solana") {
        derivedAddress = deriveSolanaAddress(Number(userId));
      } else if(chain == "ethereum") {
        derivedAddress = deriveEthereumAddress(Number(userId));
      } else if(chain == "bitcoin") {
        derivedAddress = deriveBitcoinAddress(Number(userId));
      } else {
        return Send.badRequest(res, {}, "Blockchain not supported");
      }

      await prisma.deposit_addresses.upsert({
        where: {
          user_id_chain_currency: {
            user_id: Number(userId),
            chain,
            currency
          }
        },
        create: {
          user_id: Number(userId),
          chain,
          currency,
          address: derivedAddress
        },
        update: {
          address: derivedAddress
        }
      });

      return Send.success(res, { address: derivedAddress });

    } catch (error) {
      return Send.error(res, {}, (error as Error).message || "Internal server error");
    }
  }
}

export default WalletController;
