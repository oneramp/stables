import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { alchemy } from "../actions/alchemy";
import { formatUnits } from "viem";
import { AssetTransfersCategory, AssetTransfersResult } from "alchemy-sdk";
import { AlchemyTransaction } from "../../types";

const KESC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_KESC_CONTRACT_ADDRESS;

if (!KESC_CONTRACT_ADDRESS) {
  throw new Error(
    "NEXT_PUBLIC_KESC_CONTRACT_ADDRESS is not defined in environment variables"
  );
}

export function useAlchemyTransactions() {
  const [transactions, setTransactions] = useState<AlchemyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const fetchTransactions = useCallback(async () => {
    if (!address || !KESC_CONTRACT_ADDRESS) return;

    setIsLoading(true);
    setError(null);

    try {
      // Remove fromAddress to get all transactions
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
      const sortedTransactions = formattedTransactions.sort((a, b) => {
        return Number(b.blockNumber - a.blockNumber);
      });

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching Alchemy transactions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch transactions"
      );
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [address, fetchTransactions]);

  return {
    transactions,
    refresh: fetchTransactions,
    isLoading,
    error,
    hasTransactions: transactions.length > 0,
  };
}
