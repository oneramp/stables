import React, { useState } from "react";
import ActionSheet from "./ui/action-sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { BsChevronDoubleDown } from "react-icons/bs";
import OrderSummaryCard from "./order-summary-card";
import TransactionStatus from "./transaction-status";

interface SellActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TransactionState = "input" | "processing" | "success" | "cancelled";

const SellActionSheet = ({ isOpen, onClose }: SellActionSheetProps) => {
  const [transactionState, setTransactionState] =
    useState<TransactionState>("input");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    setTransactionState("processing");
    // Simulate transaction process
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      setTransactionState(Math.random() > 0.5 ? "success" : "cancelled");
    }, 3000);
  };

  const handleDone = () => {
    // Reset form and close
    setTransactionState("input");
    setAmount("");
    setPhone("");
    onClose();
  };

  const handleTryAgain = () => {
    // Reset to input state
    setTransactionState("input");
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
          status={
            transactionState === "processing"
              ? "processing"
              : transactionState === "success"
              ? "success"
              : "cancelled"
          }
          amount={amount || "5.00"}
          reference="1749664700111c40"
          agent={{
            name: "Geofrey Lamech K.",
            initials: "GL",
          }}
          date="Jun 11, 2025"
          time="8:58PM"
          fee="0.00"
          type="sell"
          onDone={handleDone}
          onTryAgain={handleTryAgain}
        />
      </ActionSheet>
    );
  }

  return (
    <ActionSheet isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          {/* Amount Input */}
          <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
            <Label
              className="font-light text-sm text-muted-foreground"
              htmlFor="amount"
            >
              Selling (KES)
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

          {/* Phone Number Input */}
          <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
            <Label
              className="font-light text-sm text-muted-foreground"
              htmlFor="phone"
            >
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="077XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-0 !text-3xl !tracking-tight !font-semibold !bg-transparent !shadow-none !border-none !outline-none !outline-0 !ring-0 focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none"
            />
          </div>

          <div className="flex w-full items-center justify-center">
            <BsChevronDoubleDown />
          </div>

          {/* Transaction Summary */}
          <OrderSummaryCard />
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            className="w-full bg-black text-white rounded-full py-6 text-base hover:bg-black/90"
            onClick={handleSubmit}
          >
            Initiate Sale
          </Button>
        </div>
      </div>
    </ActionSheet>
  );
};

export default SellActionSheet;
