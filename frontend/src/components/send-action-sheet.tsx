import { useState, useEffect } from "react";
import ActionSheet from "./ui/action-sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { KESC_ABI, KESC_ADDRESS } from "@/config/contracts";
import SendTransactionStatus from "./send-transaction-status";
import { parseEther } from "viem";
import { useKescTransactions } from "@/hooks/use-kesc-transactions";
import { useTransferStore } from "@/store/transfer";
import { useQuoteStore } from "@/store/quote";
import { useKescBalance } from "@/hooks/use-kesc-balance";
import { useTransactionRefreshStore } from "@/store/transactions";
import { useQueryClient } from "@tanstack/react-query";

interface SendActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TransactionState = "input" | "processing" | "success" | "cancelled";

const SendActionSheet = ({ isOpen, onClose }: SendActionSheetProps) => {
  // Get QueryClient from the context
  const queryClient = useQueryClient();

  const [transactionState, setTransactionState] =
    useState<TransactionState>("input");
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { refresh: refreshTransactions } = useKescTransactions();
  const publicClient = usePublicClient();
  const setTransferData = useTransferStore((state) => state.setTransferData);
  const { clearQuoteData } = useQuoteStore();

  const { refetch } = useKescBalance();
  const { refresh } = useKescTransactions();
  const { refreshTransactions: globalRefreshTransactions } =
    useTransactionRefreshStore();

  // Check if sender is blacklisted
  const { data: isBlacklisted } = useReadContract({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    functionName: "isBlackListed",
    args: address ? [address] : undefined,
  });

  // Check if recipient is blacklisted when address is entered
  const { data: isRecipientBlacklisted } = useReadContract({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    functionName: "isBlackListed",
    args: recipientAddress ? [recipientAddress as `0x${string}`] : undefined,
  });

  // Check if contract is paused
  const { data: isPaused } = useReadContract({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    functionName: "paused",
    args: [],
  });

  // Check sender's balance
  const { data: balance } = useReadContract({
    address: KESC_ADDRESS,
    abi: KESC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending,
    isError,
    isSuccess,
  } = useWriteContract();

  // Watch for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for status changes
  useEffect(() => {
    // Show success as soon as the transaction is sent and accepted
    if (isSuccess) {
      setTransactionState("success");
      refreshTransactions();
      refresh();
      globalRefreshTransactions();
      if (publicClient && address) {
        publicClient.getBalance({ address });
      }
      return;
    }

    // If the transaction is confirmed, set to success and refresh (optional, for mined status)
    if (isConfirmed) {
      setTransactionState("success");
      refreshTransactions();
      refresh();
      if (publicClient && address) {
        publicClient.getBalance({ address });
      }
      return;
    }

    // If pending or confirming, set to processing
    if (isPending || isConfirming) {
      setTransactionState("processing");
      return;
    }

    // If error, set to cancelled
    if (isError || isReceiptError) {
      const errorMessage = writeError?.message || receiptError?.message;
      if (errorMessage?.includes("insufficient")) {
        setError("Insufficient balance");
      } else if (errorMessage?.includes("blacklisted")) {
        setError("Address is blacklisted");
      } else if (errorMessage?.includes("paused")) {
        setError("Transfers are currently paused");
      } else {
        setError(errorMessage || "Transaction failed");
      }
      setTransactionState("cancelled");
    }
  }, [
    isPending,
    isConfirming,
    isSuccess,
    isConfirmed,
    isError,
    writeError,
    isReceiptError,
    receiptError,
    hash,
    refreshTransactions,
    publicClient,
    address,
    refresh,
    globalRefreshTransactions,
  ]);

  const handleSubmit = async () => {
    try {
      setError(null);
      setTransactionState("input");

      if (!amount || !recipientAddress) {
        throw new Error("Please enter both amount and recipient address");
      }

      if (!address) {
        throw new Error("Please connect your wallet");
      }

      // Check if contract is paused
      if (isPaused) {
        throw new Error("Transfers are currently paused");
      }

      // Check blacklist status
      if (isBlacklisted) {
        throw new Error("Your address is blacklisted");
      }

      if (isRecipientBlacklisted) {
        throw new Error("Recipient address is blacklisted");
      }

      // Convert amount to Wei (18 decimals)
      const amountInWei = parseEther(amount);

      // Check balance
      if (balance && amountInWei > balance) {
        throw new Error("Insufficient balance");
      }

      // Send the transaction
      writeContract({
        abi: KESC_ABI,
        address: KESC_ADDRESS,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, amountInWei],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setTransactionState("cancelled");
    }
  };

  const handleDone = () => {
    // Reset form and close
    setTransactionState("input");
    setAmount("");
    setRecipientAddress("");
    setError(null);
    onClose();

    clearQuoteData();
    setTransferData(null);

    // Refetch all wallet balances and transactions
    refetch();
    refresh();
    refreshTransactions();
    globalRefreshTransactions();
    queryClient.invalidateQueries();
  };

  const handleTryAgain = () => {
    // Reset to input state
    setTransactionState("input");
    setError(null);
  };

  const getTitle = () => {
    switch (transactionState) {
      case "processing":
        return "Processing Transfer";
      case "success":
        return "Transaction Details";
      case "cancelled":
        return "Transaction Failed";
      default:
        return "Send KESC";
    }
  };

  if (transactionState !== "input") {
    return (
      <ActionSheet isOpen={isOpen} onClose={onClose} title={getTitle()}>
        <SendTransactionStatus
          status={transactionState}
          amount={amount}
          hash={hash || ""}
          recipientAddress={recipientAddress}
          date={new Date().toLocaleDateString()}
          time={new Date().toLocaleTimeString()}
          onDone={handleDone}
          onTryAgain={handleTryAgain}
        />
        {error && (
          <div className="mt-4 text-sm text-center text-red-500">{error}</div>
        )}
      </ActionSheet>
    );
  }

  return (
    <ActionSheet isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <div className="flex flex-col px-4 h-full">
        <div className="flex-1 space-y-6">
          {/* Amount Input */}
          <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
            <Label
              className="text-sm font-light text-muted-foreground"
              htmlFor="amount"
            >
              Amount (KESC)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="12,3455"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-0 !text-4xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            />
          </div>

          {/* Recipient Address Input */}
          <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
            <Label
              className="text-sm font-light text-muted-foreground"
              htmlFor="address"
            >
              Recipient Address
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="px-0 !text-xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            />
          </div>

          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center items-center pt-6 w-full">
          <Button
            className="p-6 w-full text-base text-white bg-black rounded-full hover:bg-black/90"
            onClick={handleSubmit}
            disabled={!amount || !recipientAddress || isPending}
          >
            {isPending ? "Sending..." : "Send KESC"}
          </Button>
        </div>
      </div>
    </ActionSheet>
  );
};

export default SendActionSheet;
