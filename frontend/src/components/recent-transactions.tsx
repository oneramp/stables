import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "deposit" | "sell";
  amount: string;
  date: string;
  status: "success" | "pending" | "failed";
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "1234",
    type: "deposit",
    amount: "25,000",
    date: "Today, 2:30 PM",
    status: "success",
  },
  {
    id: "1235",
    type: "sell",
    amount: "15,000",
    date: "Yesterday, 4:15 PM",
    status: "success",
  },
  {
    id: "1236",
    type: "deposit",
    amount: "5,000",
    date: "Mar 15, 4:30 PM",
    status: "pending",
  },
];

const RecentTransactions = ({
  transactions = SAMPLE_TRANSACTIONS,
}: RecentTransactionsProps) => {
  return (
    <div className="w-full">
      <div className="flex px-8">
        <h2 className="text-base font-semibold mb-4">Recent Transactions</h2>
      </div>
      <div className="">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-transparent border-b-[1px] border-gray-200 rounded-xl"
          >
            {/* Left side - Icon and type */}
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  transaction.type === "deposit"
                    ? "bg-green-100"
                    : "bg-orange-100"
                )}
              >
                {transaction.type === "deposit" ? (
                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {transaction.type === "deposit" ? "Deposit" : "Sale"}
                </p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
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
