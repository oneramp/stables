import React from "react";

interface OrderSummaryCardProps {
  youPay: string | number;
  youGet: string | number;
  exchangeRate: string;
  payLabel?: string;
  getLabel?: string;
}

const OrderSummaryCard = ({
  youPay,
  youGet,
  exchangeRate,
  payLabel = "You Pay",
  getLabel = "You Get",
}: OrderSummaryCardProps) => {
  return (
    <div className="bg-neutral-100 border-[1px] border-gray-200  rounded-xl p-4 space-y-3">
      <h3 className="font-medium">Transaction Summary</h3>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">{payLabel}</span>
        <span className="font-medium">{youPay}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">{getLabel}</span>
        <span className="font-medium">{youGet}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Exchange Rate</span>
        <span className="font-medium">{exchangeRate}</span>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
