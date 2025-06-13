"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import Image from "next/image";
import React from "react";

const WalletGuard = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAppKitAccount();

  if (!isConnected) {
    return (
      <div className="h-screen bg-[#1A2027] flex items-center justify-center p-4">
        <div className="w-full md:w-[26%] h-full md:h-[80%] bg-white md:rounded-[32px] overflow-hidden py-12 px-6 flex flex-col items-center justify-center space-y-8">
          <div className="flex gap-2 items-center">
            <Image src="/oneramp.svg" alt="logo" width={120} height={42} />
            <span className="bg-[#E7F0FF] text-[#3B82F6] text-xs px-2 py-0.5 rounded-full font-medium">
              BETA
            </span>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Connect Wallet</h2>
            <p className="text-sm text-gray-500">
              Please connect your wallet to access the app
            </p>
          </div>

          <appkit-button label="Connect Wallet" balance="hide" />
        </div>
      </div>
    );
  }

  return children;
};

export default WalletGuard;
