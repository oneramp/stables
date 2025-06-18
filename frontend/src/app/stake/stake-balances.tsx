"use client";
import PayFeatureCards from "@/app/pay/pay-feature-cards";
import { useKescBalance } from "@/hooks/use-kesc-balance";
import { useState } from "react";
import {
  FaCircleArrowDown,
  FaCircleArrowRight,
  FaCircleArrowUp,
} from "react-icons/fa6";
import { TbChevronCompactDown } from "react-icons/tb";
import { useAccount } from "wagmi";
import FeatureBtn from "@/components/buttons/feature-btn";
import BuyActionSheet from "@/components/buy-action-sheet";
import ReceiveActionSheet from "@/components/receive-action-sheet";
import SellActionSheet from "@/components/sell-action-sheet";
import SendActionSheet from "@/components/send-action-sheet";

const StakeBalances = ({ pay }: { pay?: boolean }) => {
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const { balance, isLoading } = useKescBalance();
  const { isConnected } = useAccount();

  return (
    <div className="flex relative flex-col justify-center items-center h-1/2 bg-white">
      {/* Balances */}
      <div className="flex flex-col items-center w-full bg-white border-b-2 border-gray-200">
        <div className="flex items-baseline">
          <h1 className="text-5xl font-bold">
            <span className="text-lg text-gray-800">KESC</span>{" "}
            {isConnected
              ? isLoading
                ? "0.00"
                : balance?.toLocaleString()
              : "N/A"}
          </h1>
        </div>

        <TbChevronCompactDown className="font-light animate-bounce size-10 text-muted-foreground" />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center p-4 w-full h-1/2 bg-slate-100"></div>

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
      <SendActionSheet
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
      />
    </div>
  );
};

export default StakeBalances;
