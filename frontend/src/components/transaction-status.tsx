import React from "react";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type TransactionStatus = "processing" | "success" | "cancelled";

interface TransactionStatusProps {
  status: TransactionStatus;
  amount: string;
  reference: string;
  agent?: {
    name: string;
    initials: string;
  };
  date: string;
  time: string;
  fee: string;
  type: "deposit" | "sell";
  onDone?: () => void;
  onTryAgain?: () => void;
}

const TransactionStatus = ({
  status,
  amount,
  reference,
  agent,
  date,
  time,
  fee,
  type,
  onDone,
  onTryAgain,
}: TransactionStatusProps) => {
  const statusConfig = {
    processing: {
      icon: <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />,
      text: type === "deposit" ? "Processing Deposit" : "Processing Sale",
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
    success: {
      icon: <Check className="w-12 h-12 text-green-500" />,
      text: type === "deposit" ? "Deposit Successful" : "Sale Successful",
      bgColor: "bg-green-50",
      textColor: "text-green-500",
    },
    cancelled: {
      icon: <X className="w-12 h-12 text-red-500" />,
      text: type === "deposit" ? "Deposit Cancelled" : "Sale Cancelled",
      bgColor: "bg-red-50",
      textColor: "text-red-500",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="flex flex-col items-center h-full">
          {/* Status Icon */}
          <div
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center mb-6",
              config.bgColor
            )}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white">
              {config.icon}
            </div>
          </div>

          {/* Transaction Info */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">
              {type === "deposit"
                ? "Deposited via OneRamp"
                : "Sold via OneRamp"}
            </p>
            <h1 className="text-4xl font-semibold mb-2">
              KES {amount.toLocaleString()}
            </h1>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm",
                config.bgColor,
                config.textColor
              )}
            >
              {status === "processing"
                ? "In Progress"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {/* Transaction Details */}
          <div className="w-full space-y-6 bg-neutral-100 border-[1px] border-gray-200 rounded-xl p-4">
            <div className="">
              <DetailItem label="Reference" value={reference} />
              <DetailItem label="Date" value={date} />
              <DetailItem label="Time" value={time} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {status !== "processing" && (
        <div className="pt-6">
          <Button
            className="w-full bg-black text-white rounded-full py-6 text-base hover:bg-black/90"
            onClick={status === "success" ? onDone : onTryAgain}
          >
            {status === "success" ? "Done" : "Try Again"}
          </Button>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  prefix,
}: {
  label: string;
  value: string;
  prefix?: React.ReactNode;
}) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-500">{label}</span>
    <div className="flex items-center">
      {prefix}
      <span className="font-medium">{value}</span>
    </div>
  </div>
);

export default TransactionStatus;
