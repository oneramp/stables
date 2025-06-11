"use client";
import { ArrowDownToLine, Plus } from "lucide-react";
import Image from "next/image";
import { TbChevronCompactDown } from "react-icons/tb";
import { Button } from "./ui/button";
import { useState } from "react";
import BuyActionSheet from "./buy-action-sheet";
import SellActionSheet from "./sell-action-sheet";

const BalancesCard = () => {
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);

  return (
    <div className="flex flex-col h-1/2 relative">
      {/* Balances */}
      <div className="flex items-center flex-col  bg-white border-b-2 border-gray-200">
        <div className="flex items-baseline ">
          <h1 className="text-5xl font-bold">
            <span className="text-gray-800 text-lg">KESC</span> 5,000
          </h1>
        </div>

        <TbChevronCompactDown className="size-10 font-light text-muted-foreground animate-bounce" />

        <div className="w-full  flex items-center justify-center pb-5">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-4 py-4 border-1 rounded-full w-full border-dashed border-gray-200 bg-white"
          >
            <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center overflow-hidden">
              <Image
                src="/images/providers/mpesa-logo.webp"
                alt="mpesa"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium">MPESA</span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center w-full gap-2 px-4 py-4 rounded-full border-1 border-dashed border-gray-200 "
          >
            <div className="w-6 h-6 rounded-full  flex items-center justify-center overflow-hidden">
              <Image
                src="/images/flags/kenya.png"
                alt="mpesa"
                width={25}
                height={25}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-black">KENYA</span>
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center w-2/3 mx-auto">
        <button
          className="flex flex-col items-center gap-2 border-none bg-transparent hover:bg-transparent"
          onClick={() => setIsBuyOpen(true)}
        >
          <div className="w-12 h-12 rounded-full bg-[#E97451] flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm text-gray-600">Buy</span>
        </button>

        <button
          className="flex flex-col items-center gap-2 border-none bg-transparent hover:bg-transparent"
          onClick={() => setIsSellOpen(true)}
        >
          <div className="w-12 h-12 rounded-full bg-[#E97451] flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm text-gray-600">Sell</span>
        </button>

        <button className="flex flex-col items-center gap-2 border-none bg-transparent hover:bg-transparent">
          <div className="w-12 h-12 rounded-full bg-[#E97451] flex items-center justify-center">
            <ArrowDownToLine className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm text-gray-600">Receive</span>
        </button>
      </div>

      {/* Action Sheets */}
      <BuyActionSheet isOpen={isBuyOpen} onClose={() => setIsBuyOpen(false)} />
      <SellActionSheet
        isOpen={isSellOpen}
        onClose={() => setIsSellOpen(false)}
      />
    </div>
  );
};

export default BalancesCard;
