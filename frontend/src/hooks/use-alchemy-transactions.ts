import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { alchemy } from "../actions/alchemy";
import { formatUnits } from "viem";
import { AssetTransfersCategory, AssetTransfersResult } from "alchemy-sdk";
import { AlchemyTransaction } from "../../types";
import { useTransactionRefreshStore } from "@/store/transactions";

const KESC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_KESC_CONTRACT_ADDRESS;

if (!KESC_CONTRACT_ADDRESS) {
  throw new Error(
    "NEXT_PUBLIC_KESC_CONTRACT_ADDRESS is not defined in environment variables"
  );
}

async function fetchAlchemyTransactions(
  address: string
): Promise<AlchemyTransaction[]> {
  if (!address || !KESC_CONTRACT_ADDRESS) {
    return [];
  }

  const data = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    category: [AssetTransfersCategory.ERC20],
    contractAddresses: [KESC_CONTRACT_ADDRESS],
  });

  const formattedTransactions: AlchemyTransaction[] = data.transfers
    .filter(
      (transfer: AssetTransfersResult) =>
        transfer.from?.toLowerCase() === address.toLowerCase() ||
        transfer.to?.toLowerCase() === address.toLowerCase()
    )
    .map((transfer: AssetTransfersResult) => {
      const decimals =
        transfer.rawContract && transfer.rawContract.decimal
          ? parseInt(transfer.rawContract.decimal, 16)
          : 18; // fallback to 18 if not present
      const rawValue =
        transfer.rawContract && transfer.rawContract.value
          ? transfer.rawContract.value
          : "0";
      const amount = formatUnits(BigInt(rawValue), decimals);

      return {
        id: transfer.hash,
        type:
          transfer.from?.toLowerCase() === address.toLowerCase()
            ? "send"
            : "receive",
        amount,
        status: "success" as const,
        date: new Date(Number(transfer.blockNum) * 1000).toISOString(),
        from: transfer.from,
        to: transfer.to || "",
        blockNumber: BigInt(transfer.blockNum),
        category: transfer.category,
      };
    });

  // Sort by block number (descending)
  return formattedTransactions.sort((a, b) => {
    return Number(b.blockNumber - a.blockNumber);
  });
}

export function useAlchemyTransactions() {
  const { address } = useAccount();
  const refreshCount = useTransactionRefreshStore((s) => s.refreshCount);

  const {
    data: transactions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["alchemy-transactions", address, refreshCount],
    queryFn: () => fetchAlchemyTransactions(address!),
    enabled: !!address,
    // staleTime: 30000, // Consider data fresh for 30 seconds
    // gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    transactions,
    refresh: refetch,
    isLoading,
    error: error?.message || null,
    hasTransactions: transactions.length > 0,
  };
}
