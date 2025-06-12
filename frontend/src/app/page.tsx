"use client";

import BalancesCard from "@/components/balances-card";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Gift, Navigation } from "lucide-react";
import PageLayoutContainer from "@/components/page-layout-container";
import RecentTransactions from "@/components/recent-transactions";
import SendActionSheet from "@/components/send-action-sheet";
import { useState } from "react";

export default function Home() {
  const [isSendOpen, setIsSendOpen] = useState(false);

  return (
    <PageLayoutContainer>
      <Header />

      {/* Amount Display */}
      <BalancesCard />

      {/* Recent Transactions */}
      <div className="">
        <RecentTransactions />
      </div>

      {/* Bottom Tabs */}
      <div className="flex sticky bottom-0 z-10 flex-row gap-4 justify-between items-center w-full">
        <Button
          className="flex flex-row justify-center items-center px-8 py-6 w-full text-base bg-black rounded-full border-none"
          onClick={() => setIsSendOpen(true)}
        >
          Send
          <Navigation className="ml-2 size-8" />
        </Button>

        <Button
          className="flex flex-row justify-center items-center px-8 py-6 w-full text-base bg-black rounded-full border-none"
          // onClick={() => setIsReceiveOpen(true)}
        >
          Pay bill
          <Gift className="ml-2 size-8" />
        </Button>
      </div>

      {/* Action Sheets */}
      <SendActionSheet
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
      />
    </PageLayoutContainer>
  );
}
