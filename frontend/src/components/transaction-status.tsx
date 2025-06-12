import React from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTransferStore } from "@/store/transfer";

type TransactionStatusType =
  | "processing"
  | "success"
  | "cancelled"
  | "idle"
  | "pending"
  | "error";

interface TransactionStatusProps {
  status: TransactionStatusType;
  amount: string;
  reference: string;
  agent: {
    name: string;
    initials: string;
  };
  date: string;
  time: string;
  fee: string;
  type: "deposit" | "sell";
  onDone: () => void;
  onTryAgain: () => void;
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
  const { transferData } = useTransferStore();

  const statusConfig = {
    processing: {
      icon: <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />,
      text: type === "deposit" ? "Processing Deposit" : "Processing Sale",
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
    pending: {
      icon: <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />,
      text: type === "deposit" ? "Processing Deposit" : "Processing Sale",
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      text: type === "deposit" ? "Deposit Successful" : "Sale Successful",
      bgColor: "bg-green-50",
      textColor: "text-green-500",
    },
    cancelled: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      text: type === "deposit" ? "Deposit Failed" : "Sale Failed",
      bgColor: "bg-red-50",
      textColor: "text-red-500",
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      text: type === "deposit" ? "Deposit Failed" : "Sale Failed",
      bgColor: "bg-red-50",
      textColor: "text-red-500",
    },
    idle: {
      icon: null,
      text: "",
      bgColor: "",
      textColor: "",
    },
  };

  if (status === "idle") return null;

  const config = statusConfig[status];

  console.log("====================================");
  console.log("transferData", transferData);
  console.log("====================================");

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="flex flex-col items-center h-full">
          {/* Status Icon */}
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${config.bgColor}`}
          >
            <div className="flex justify-center items-center w-16 h-16 bg-white rounded-full">
              {config.icon}
            </div>
          </div>

          {/* Transaction Info */}
          <div className="mb-8 text-center">
            <p className="mb-2 text-gray-600">
              {type === "deposit"
                ? "Deposited via OneRamp"
                : "Sold via OneRamp"}
            </p>
            <div className="flex flex-col items-center">
              <h1 className="mb-2 text-4xl font-semibold">
                KES {amount.toLocaleString()}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm ${config.bgColor} ${config.textColor}`}
              >
                {status === "processing" || status === "pending"
                  ? "In Progress"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="w-full space-y-6 bg-neutral-100 border-[1px] border-gray-200 rounded-xl p-4">
            <div className="">
              <DetailItem label="Reference" value={reference} />
              <DetailItem label="Date" value={date} />
              <DetailItem label="Time" value={time} />
              <DetailItem label="Fee" value={`KES ${fee}`} />
              <DetailItem label="Agent" value={agent.name} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {status !== "processing" && status !== "pending" && (
        <div className="pt-6">
          <Button
            className="py-6 w-full text-base text-white bg-black rounded-full hover:bg-black/90"
            onClick={status === "success" ? onDone : onTryAgain}
          >
            {status === "success" ? "Done" : "Try Again"}
          </Button>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default TransactionStatus;
