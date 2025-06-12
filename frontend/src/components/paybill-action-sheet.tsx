"use client";

import { useState, useEffect } from "react";
import ActionSheet from "./ui/action-sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAppKitAccount } from "@reown/appkit/react";
import { useKescBalance } from "@/hooks/use-kesc-balance";
import { useKescTransactions } from "@/hooks/use-kesc-transactions";
import { getPayBillQuote } from "../../actions/quote";
import {
  createPayBillTransfer,
  submitOnChainTransactionHash,
} from "../../actions/transfer";
import { CHAIN, COUNTRY } from "../../constants";
import { countries } from "../../data";
import { PayBillQuoteT, PayBillTransferT } from "../../types";
import { KESC_ABI, KESC_ADDRESS } from "@/config/contracts";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import TransactionStatus from "./transaction-status";
import { useTransferStore } from "@/store/transfer";

interface PayBillActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TransactionState = "input" | "processing" | "success" | "cancelled";

// Define keypad letters - reused from ReceiveActionSheet
const KEYPAD_LETTERS: { [key: string]: string } = {
  "1": "",
  "2": "ABC",
  "3": "DEF",
  "4": "GHI",
  "5": "JKL",
  "6": "MNO",
  "7": "PQRS",
  "8": "TUV",
  "9": "WXYZ",
  "0": "",
};

const PayBillActionSheet = ({ isOpen, onClose }: PayBillActionSheetProps) => {
  const [businessNumber, setBusinessNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionState, setTransactionState] =
    useState<TransactionState>("input");
  const [error, setError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);

  const setTransferData = useTransferStore((state) => state.setTransferData);
  const transferData = useTransferStore((state) => state.transferData);

  const { address } = useAppKitAccount();
  const { refetch } = useKescBalance();
  const { refresh } = useKescTransactions();

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === "" || regex.test(value)) {
      // Check if the amount is within valid range
      if (value === "" || parseFloat(value) <= 999999.99) {
        setAmount(value);
      }
    }
  };

  const handlePayBill = async () => {
    try {
      // Clear any previous errors and data
      setError(null);
      setQuoteData(null);
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

      // Get pay bill quote
      const quotePayload: PayBillQuoteT = {
        fiatType: country.currency,
        cryptoType: "USDC",
        region: country.symbol,
        fiatAmount: amount,
        network: CHAIN,
        country: country.symbol,
        address: address,
        rawAmount: amount,
      };

      const quote = await getPayBillQuote(quotePayload);

      if (!quote) {
        throw new Error("No response received from API");
      }

      // Store the quote data
      setQuoteData(quote);

      // Create pay bill transfer
      const transferPayload: PayBillTransferT = {
        quoteId: quote.quote.quoteId,
        accountName: "OneRamp", // You might want to make this dynamic
        accountNumber: accountNumber,
        businessNumber: businessNumber,
      };

      const transferResponse = await createPayBillTransfer(transferPayload);

      if (!transferResponse) {
        throw new Error("No response received from API");
      }

      // Store the transfer response in the global store
      setTransferData(transferResponse);

      const { transferAddress } = transferResponse;

      // Convert the amountPaid to Wei (assuming 18 decimals)
      const amountInWei = parseEther(quote.quote.fiatAmount);

      // Send the token transfer transaction
      writeContract({
        address: KESC_ADDRESS,
        abi: KESC_ABI,
        functionName: "transfer",
        args: [transferAddress as `0x${string}`, amountInWei],
      });
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = err.message;

        if (errorMessage.includes("API key")) {
          setError("Service configuration error. Please contact support.");
        } else if (errorMessage.includes("connection")) {
          setError(
            "Network error. Please check your connection and try again."
          );
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
          setTransactionState("success");
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
    setQuoteData(null);
    setTransferData(null);
    setBusinessNumber("");
    setAccountNumber("");
    setAmount("");
    onClose();

    // Refetch all wallet balances and transactions
    refetch();
    refresh();
  };

  const handleTryAgain = () => {
    setTransactionState("input");
    setError(null);
    setQuoteData(null);
    setTransferData(null);
  };

  const getTitle = () => {
    switch (transactionState) {
      case "processing":
        return "Processing Payment";
      case "success":
        return "Transaction Details";
      case "cancelled":
        return "Transaction Failed";
      default:
        return "Pay Bill";
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
          type="bill"
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
      <div className="flex flex-col px-4 h-full bg-white">
        <div className="flex flex-col gap-6">
          {/* Business Number Input */}
          <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
            <Label
              className="text-sm font-light text-muted-foreground"
              htmlFor="business-number"
            >
              Business Number
            </Label>
            <Input
              id="business-number"
              type="text"
              value={businessNumber}
              onChange={(e) => setBusinessNumber(e.target.value)}
              className="px-0 !text-3xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            />
          </div>

          {/* Account Number Input */}
          <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
            <Label
              className="text-sm font-light text-muted-foreground"
              htmlFor="account-number"
            >
              Account Number
            </Label>
            <Input
              id="account-number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="px-0 !text-3xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            />
          </div>

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
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="px-0 !text-3xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            />
          </div>

          {/* Pay Button */}
          <div className="flex justify-center items-center pt-6 w-full">
            <Button
              onClick={handlePayBill}
              disabled={
                !businessNumber ||
                !accountNumber ||
                !amount ||
                parseFloat(amount) === 0
              }
              className="p-6 w-full text-base text-white rounded-full border-none hover:bg-primary/90"
            >
              Pay Bill
            </Button>
          </div>
        </div>
      </div>
    </ActionSheet>
  );
};

export default PayBillActionSheet;
