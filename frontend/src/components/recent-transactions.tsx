"use client";

import React from "react";
import { Send, ReceiptIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlchemyTransactions } from "@/hooks/use-alchemy-transactions";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";
import { AlchemyTransaction } from "../../types";

interface RecentTransactionsProps {
  transactions?: AlchemyTransaction[];
}

const RecentTransactions = ({
  transactions: propTransactions,
}: RecentTransactionsProps) => {
  const { transactions: hookTransactions } = useAlchemyTransactions();
  const { isConnected } = useAccount();

  // Use provided transactions or hook transactions
  const transactions = propTransactions || hookTransactions;

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
        No transactions found
      </div>
    );
  }

  const getTransactionIcon = (type: AlchemyTransaction["type"]) => {
    return type === "send" ? (
      <Send className="w-5 h-5 text-red-600" />
    ) : (
      <ReceiptIcon className="w-5 h-5 text-blue-600" />
    );
  };

  const getTransactionColor = (type: AlchemyTransaction["type"]) => {
    return type === "send" ? "bg-red-100" : "bg-blue-100";
  };

  const getTransactionLabel = (type: AlchemyTransaction["type"]) => {
    return type === "send" ? "Sent KESC" : "Received KESC";
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
            className="flex items-center justify-between p-4 bg-transparent border-b-[1px] border-gray-200"
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
              </div>
            </div>

            {/* Right side - Amount and status */}
            <div className="text-right">
              <p className="font-semibold">{transaction.amount} KESC</p>
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
