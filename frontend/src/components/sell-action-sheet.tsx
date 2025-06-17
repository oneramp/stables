"use client";

import { KESC_ABI, KESC_ADDRESS } from "@/config/contracts";
import { useKescBalance } from "@/hooks/use-kesc-balance";
import { useKescTransactions } from "@/hooks/use-kesc-transactions";
import { quoteSchema, type QuoteFormData } from "@/lib/validations/quote";
import { useQuoteStore } from "@/store/quote";
import { useTransferStore } from "@/store/transfer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsChevronDoubleDown } from "react-icons/bs";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getQuoteOut } from "../../actions/quote";
import {
  createTransferOut,
  submitOnChainTransactionHash,
} from "../../actions/transfer";
import { CHAIN, COUNTRY, OPERATOR, MINMAX } from "../../constants";
import { countries, MOCK_USER_DETAILS } from "../../data";
import { QuoteT, TransferT } from "../../types";
import OrderSummaryCard from "./order-summary-card";
import TransactionStatus from "./transaction-status";
import ActionSheet from "./ui/action-sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useQueryClient } from "@tanstack/react-query";

interface SellActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TransactionState = "input" | "processing" | "success" | "cancelled";

const SellActionSheet = ({ isOpen, onClose }: SellActionSheetProps) => {
  // Get QueryClient from the context
  const queryClient = useQueryClient();

  const [transactionState, setTransactionState] =
    useState<TransactionState>("input");
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  // Use separate selectors for each value
  const transferData = useTransferStore((state) => state.transferData);
  const setTransferData = useTransferStore((state) => state.setTransferData);
  const { quoteData, setQuoteData, clearQuoteData } = useQuoteStore();

  const { refetch } = useKescBalance();
  const { refresh } = useKescTransactions();

  const { address } = useAppKitAccount();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError: setFormError,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
  });

  const { writeContract, data: hash } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Validate amount against MINMAX
  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    if (value && (numValue < MINMAX.MIN || numValue > MINMAX.MAX)) {
      setAmountError(
        `Amount must be between ${MINMAX.MIN} and ${MINMAX.MAX} KESC`
      );
      return false;
    }
    setAmountError(null);
    return true;
  };

  const onSubmit = async (data: QuoteFormData) => {
    try {
      // Validate amount before proceeding
      if (!validateAmount(data.amount)) {
        return;
      }

      // Clear any previous errors and data
      setError(null);
      clearQuoteData();
      setTransferData(null);

      if (!address) {
        setError("Please connect your wallet to continue");
        return;
      }

      if (!COUNTRY || !CHAIN) {
        setError("Application configuration error. Please contact support.");
        return;
      }

      setTransactionState("processing");

      const country = countries[COUNTRY];
      if (!country) {
        setError("Invalid country configuration");
        setTransactionState("cancelled");
        return;
      }

      const payload: QuoteT = {
        fiatType: country.currency,
        cryptoType: "USDC",
        network: CHAIN,
        fiatAmount: data.amount,
        country: country.symbol,
        address: address,
      };

      // Call the OneRamp API to get a quote
      const quote = await getQuoteOut(payload);

      if (!quote) {
        throw new Error("No response received from API");
      }

      // Store the quote in global state
      setQuoteData(quote);

      const transferOutPayload: TransferT = {
        phone: `+${data.phone}`,
        operator: OPERATOR!,
        quoteId: quote.quote.quoteId,
        userDetails: MOCK_USER_DETAILS,
      };

      const transferOutResponse = await createTransferOut(transferOutPayload);

      if (!transferOutResponse) {
        throw new Error("No response received from API");
      }

      const { transferAddress } = transferOutResponse;

      // Store the transfer response in global state
      setTransferData(transferOutResponse);

      // Convert the amountPaid to Wei (assuming 18 decimals)
      const amountInWei = parseEther(quote.quote.amountPaid);

      // Send the token transfer transaction
      writeContract({
        address: KESC_ADDRESS,
        abi: KESC_ABI,
        functionName: "transfer",
        args: [transferAddress as `0x${string}`, amountInWei],
      });
    } catch (err) {
      // Handle specific error cases
      if (err instanceof Error) {
        const errorMessage = err.message;

        if (errorMessage.includes("API key")) {
          setError("Service configuration error. Please contact support.");
        } else if (errorMessage.includes("connection")) {
          setError(
            "Network error. Please check your connection and try again."
          );
        } else if (errorMessage.includes("Invalid amount")) {
          setFormError("amount", {
            type: "manual",
            message: "Please enter a valid amount",
          });
        } else {
          // Show the actual error message from the server
          setError(errorMessage.replace("OneRamp API Error: ", ""));
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }

      setTransactionState("cancelled");
    }
  };

  // Submit hash when blockchain transaction is confirmed
  useEffect(() => {
    const submitHash = async () => {
      if (isConfirmed && hash && transferData?.transferId) {
        try {
          await submitOnChainTransactionHash({
            txHash: hash,
            transferId: transferData.transferId,
          });
        } catch (error) {
          // If it's "already processing", that's fine - the transfer status will update
          if (
            !(
              error instanceof Error &&
              error.message.includes("Order is already being processed")
            )
          ) {
            console.error("Failed to submit transaction hash:", error);
          }
        }
      }
    };

    if (isConfirmed && hash) {
      submitHash();
    }
  }, [isConfirmed, hash, transferData?.transferId]);

  const handleDone = () => {
    setTransactionState("input");
    setError(null);
    clearQuoteData();
    setTransferData(null);
    reset();
    onClose();

    // Refetch all wallet balances and transactions
    refetch();
    refresh();
    queryClient.invalidateQueries();
  };

  const handleTryAgain = () => {
    setTransactionState("input");
    setError(null);
    clearQuoteData();
    setTransferData(null);
    reset();
  };

  const getTitle = () => {
    switch (transactionState) {
      case "processing":
        return "Processing Sale";
      case "success":
        return "Transaction Details";
      case "cancelled":
        return "Transaction Failed";
      default:
        return "Sell KESC";
    }
  };

  if (transactionState !== "input") {
    return (
      <ActionSheet isOpen={isOpen} onClose={onClose} title={getTitle()}>
        <TransactionStatus
          status={transactionState}
          amount={quoteData?.quote?.amountPaid || "0.00"}
          reference={quoteData?.quote?.quoteId || "Pending..."}
          agent={{
            name: "OneRamp",
            initials: "OR",
          }}
          date={new Date().toLocaleDateString()}
          time={new Date().toLocaleTimeString()}
          fee={quoteData?.quote?.fee || "0.00"}
          type="sell"
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col px-4 h-full"
      >
        <div className="flex-1 space-y-6">
          {/* Amount Input */}
          <div
            className={`space-y-1 border-[1px] ${
              amountError
                ? "bg-red-50 border-red-300"
                : "border-gray-200 bg-neutral-100"
            } p-3 rounded-xl transition-colors duration-200`}
          >
            <Label
              className="text-sm font-light text-muted-foreground"
              htmlFor="amount"
            >
              Selling
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="12,3455"
              {...register("amount", {
                onChange: (e) => validateAmount(e.target.value),
              })}
              className={`px-0 !text-4xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none ${
                amountError ? "text-red-600" : ""
              }`}
            />
            <div className="flex justify-between items-center">
              {amountError ? (
                <p className="text-sm text-red-500">{amountError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Valid range: {MINMAX.MIN} - {MINMAX.MAX} KESC
                </p>
              )}
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
            <Label
              className="text-sm font-light text-muted-foreground"
              htmlFor="phone"
            >
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="077XXXXXXX"
              {...register("phone")}
              className="px-0 !text-3xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-center items-center w-full">
            <BsChevronDoubleDown />
          </div>

          {/* Transaction Summary */}
          <OrderSummaryCard />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center items-center pt-6 w-full">
          <Button
            type="submit"
            className="p-6 w-full text-base text-white bg-black rounded-full hover:bg-black/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Initiate Sale"}
          </Button>
        </div>
      </form>
    </ActionSheet>
  );
};

export default SellActionSheet;
