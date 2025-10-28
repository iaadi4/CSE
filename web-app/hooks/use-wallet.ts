import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";

export interface DepositAddress {
  address: string;
  chain: string;
  currency: string;
}

export const WalletApi = {
  createDepositAddress: (chain: string, currency: string) =>
    apiClient.post<ApiResponse<{ address: string }>>("/api/wallet/deposit-address", {
      chain,
      currency,
    }),
};

// Hook to generate deposit address
export function useGenerateDepositAddress() {
  return useMutation({
    mutationFn: ({ chain, currency }: { chain: string; currency: string }) =>
      WalletApi.createDepositAddress(chain, currency),
    onError: (error: any) => {
      console.error("Failed to generate deposit address:", error);
    },
  });
}
