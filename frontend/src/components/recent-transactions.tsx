"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  ReceiptIcon,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useKescTransactions,
  type Transaction,
} from "@/hooks/use-kesc-transactions";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const RecentTransactions = ({
  transactions: propTransactions,
}: RecentTransactionsProps) => {
  const { transactions: hookTransactions } = useKescTransactions();
  const { isConnected } = useAccount();

  // Use provided transactions or hook transactions
  const transactions = propTransactions || hookTransactions;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // If less than a minute ago
    if (diffInSeconds < 60) {
      return "Just now";
    }
    // If less than an hour ago
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    // If less than a day ago
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    // If less than a week ago
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    // Otherwise return the date in a nice format
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (!isConnected) {
    return (
      <div className="py-8 w-full text-center text-gray-500">
        Connect your wallet to see your transactions
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-8 w-full text-center text-gray-500">
        {/* No transactions found */}
      </div>
    );
  }

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case "sell":
        return <ArrowUpRight className="w-5 h-5 text-orange-600" />;
      case "send":
        return <Send className="w-5 h-5 text-red-600" />;
      case "receive":
        return <ReceiptIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return "bg-green-100";
      case "sell":
        return "bg-orange-100";
      case "send":
        return "bg-red-100";
      case "receive":
        return "bg-blue-100";
    }
  };

  const getTransactionLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "sell":
        return "Sale";
      case "send":
        return "Sent";
      case "receive":
        return "Received";
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center w-full">
        <h2 className="pl-8 text-base font-semibold">Recent Transactions</h2>
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-row gap-2 items-center text-sm text-green-500 bg-transparent border-none"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="bg-white">
        {transactions.slice(0, 4).map((transaction, index) => (
          <div
            key={`${transaction.type}-${transaction.id}-${index}`}
            className="flex items-center justify-between p-4 bg-transparent border-b-[1px] border-gray-200 "
          >
            {/* Left side - Icon and type */}
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  getTransactionColor(transaction.type)
                )}
              >
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium">
                  {getTransactionLabel(transaction.type)}
                </p>
                <p className="font-mono text-xs text-gray-400">
                  {transaction.id.slice(0, 6)}...{transaction.id.slice(-4)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            {/* Right side - Amount and status */}
            <div className="text-right">
              <p className="font-semibold">KES {transaction.amount}</p>
              <p
                className={cn(
                  "text-xs",
                  transaction.status === "success" && "text-green-600",
                  transaction.status === "pending" && "text-orange-600",
                  transaction.status === "failed" && "text-red-600"
                )}
              >
                {transaction.status.charAt(0).toUpperCase() +
                  transaction.status.slice(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
