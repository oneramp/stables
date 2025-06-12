"use client";
import { ArrowDownToLine, Plus } from "lucide-react";
import Image from "next/image";
import { TbChevronCompactDown } from "react-icons/tb";
import { Button } from "./ui/button";
import { useState } from "react";
import BuyActionSheet from "./buy-action-sheet";
import SellActionSheet from "./sell-action-sheet";
import ReceiveActionSheet from "./receive-action-sheet";
import { useKescBalance } from "@/hooks/use-kesc-balance";
import { useAccount } from "wagmi";

const BalancesCard = () => {
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const { balance, isLoading } = useKescBalance();
  const { isConnected } = useAccount();

  return (
    <div className="flex relative flex-col h-1/2">
      {/* Balances */}
      <div className="flex flex-col items-center bg-white border-b-2 border-gray-200">
        <div className="flex items-baseline">
          <h1 className="text-5xl font-bold">
            <span className="text-lg text-gray-800">KESC</span>{" "}
            {isConnected
              ? isLoading
                ? "Loading..."
                : balance?.toLocaleString()
              : "Not Connected"}
          </h1>
        </div>

        <TbChevronCompactDown className="font-light animate-bounce size-10 text-muted-foreground" />

        <div className="flex justify-center items-center pb-5 w-full">
          <Button
            variant="ghost"
            className="flex gap-2 items-center px-4 py-4 w-full bg-white rounded-full border-gray-200 border-dashed border-1"
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
            className="flex gap-2 items-center px-4 py-4 w-full rounded-full border-gray-200 border-dashed border-1"
          >
            <div className="flex overflow-hidden justify-center items-center w-6 h-6 rounded-full">
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
      <div className="flex justify-center mx-auto w-2/3">
        <button
          className="flex flex-col gap-2 items-center bg-transparent border-none hover:bg-transparent"
          onClick={() => setIsBuyOpen(true)}
        >
          <div className="w-12 h-12 rounded-full bg-[#E97451] flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm text-gray-600">Buy</span>
        </button>

        <button
          className="flex flex-col gap-2 items-center bg-transparent border-none hover:bg-transparent"
          onClick={() => setIsSellOpen(true)}
        >
          <div className="w-12 h-12 rounded-full bg-[#E97451] flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm text-gray-600">Sell</span>
        </button>

        <button
          className="flex flex-col gap-2 items-center bg-transparent border-none hover:bg-transparent"
          onClick={() => setIsReceiveOpen(true)}
        >
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
      <ReceiveActionSheet
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
      />
    </div>
  );
};

export default BalancesCard;
