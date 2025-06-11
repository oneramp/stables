import React from "react";

const OrderSummaryCard = () => {
  return (
    <div className="bg-neutral-100 border-[1px] border-gray-200  rounded-xl p-4 space-y-3">
      <h3 className="font-medium">Transaction Summary</h3>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">You Pay</span>
        <span className="font-medium">KES 5,000</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">You Get</span>
        <span className="font-medium">5,000 KESC</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Exchange Rate</span>
        <span className="font-medium">1 KESC = 1 KES</span>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
