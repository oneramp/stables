import React from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface SendTransactionStatusProps {
  status: "processing" | "success" | "cancelled";
  amount: string;
  hash: string;
  recipientAddress: string;
  date: string;
  time: string;
  onDone: () => void;
  onTryAgain: () => void;
}

const SendTransactionStatus = ({
  status,
  amount,
  hash,
  recipientAddress,
  date,
  time,
  onDone,
  onTryAgain,
}: SendTransactionStatusProps) => {
  const statusConfig = {
    processing: {
      icon: <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />,
      text: "Processing Transfer",
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      text: "Transfer Successful",
      bgColor: "bg-green-50",
      textColor: "text-green-500",
    },
    cancelled: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      text: "Transfer Failed",
      bgColor: "bg-red-50",
      textColor: "text-red-500",
    },
  };

  const config = statusConfig[status];

  const { width, height } = useWindowSize();

  return (
    <div className="flex flex-col px-4 h-full">
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

          {status === "success" && <Confetti width={width} height={height} />}

          {/* Transaction Info */}
          <div className="mb-8 text-center">
            <p className="mb-2 text-gray-600">KESC Transfer</p>
            <div className="flex flex-col items-center">
              <h1 className="mb-2 text-4xl font-semibold">{amount} KESC</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm ${config.bgColor} ${config.textColor}`}
              >
                {status === "processing"
                  ? "In Progress"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="w-full space-y-6 bg-neutral-100 border-[1px] border-gray-200 rounded-xl p-4">
            <div className="">
              <DetailItem
                label="Transaction Hash"
                value={`${hash.slice(0, 6)}...${hash.slice(-4)}`}
              />
              <DetailItem
                label="Recipient"
                value={`${recipientAddress.slice(
                  0,
                  6
                )}...${recipientAddress.slice(-4)}`}
              />
              <DetailItem label="Date" value={date} />
              <DetailItem label="Time" value={time} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center items-center pt-6 w-full">
        <Button
          className="py-6 w-full text-base text-white bg-black rounded-full hover:bg-black/90"
          onClick={status === "success" ? onDone : onTryAgain}
        >
          {status === "success" ? "Done" : "Try Again"}
        </Button>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default SendTransactionStatus;
