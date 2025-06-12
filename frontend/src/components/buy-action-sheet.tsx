import { quoteSchema, type QuoteFormData } from "@/lib/validations/quote";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsChevronDoubleDown } from "react-icons/bs";
import { createTransferIn } from "../../actions/transfer";
import { getQuoteIn } from "../../actions/quote";
import { CHAIN, COUNTRY, OPERATOR } from "../../constants";
import { countries, MOCK_USER_DETAILS } from "../../data";
import { QuoteT, TransferT } from "../../types";
import OrderSummaryCard from "./order-summary-card";
import TransactionStatus from "./transaction-status";
import ActionSheet from "./ui/action-sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTransferStore } from "@/store/transfer";
import { useQuoteStore } from "@/store/quote";
import { useKescBalance } from "@/hooks/use-kesc-balance";
import { useKescTransactions } from "@/hooks/use-kesc-transactions";

interface BuyActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TransactionState = "input" | "processing" | "success" | "cancelled";

const BuyActionSheet = ({ isOpen, onClose }: BuyActionSheetProps) => {
  const [transactionState, setTransactionState] =
    useState<TransactionState>("input");
  const [error, setError] = useState<string | null>(null);
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

  const onSubmit = async (data: QuoteFormData) => {
    try {
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
      const quote = await getQuoteIn(payload);

      if (!quote) {
        throw new Error("No response received from API");
      }

      // Store the quote in global state
      setQuoteData(quote);

      const transferInPayload: TransferT = {
        phone: `+${data.phone}`,
        operator: OPERATOR!,
        quoteId: quote.quote.quoteId,
        userDetails: MOCK_USER_DETAILS,
      };

      const transferInResponse = await createTransferIn(transferInPayload);

      // Store the transfer response in global state
      setTransferData(transferInResponse);

      setTransactionState("success");
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
  };

  const handleTryAgain = () => {
    setTransactionState("input");
    setError(null);
    clearQuoteData();
    setTransferData(null);
  };

  const getTitle = () => {
    switch (transactionState) {
      case "processing":
        return "Processing Deposit";
      case "success":
        return "Transaction Details";
      case "cancelled":
        return "Transaction Failed";
      default:
        return "Buy KESC";
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
          type="deposit"
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
          <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
            <Label
              className="text-sm font-light text-muted-foreground"
              htmlFor="amount"
            >
              Depositing
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="12,3455"
              {...register("amount")}
              className="px-0 !text-4xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
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
            {isSubmitting ? "Processing..." : "Initiate Deposit"}
          </Button>
        </div>
      </form>
    </ActionSheet>
  );
};

export default BuyActionSheet;
