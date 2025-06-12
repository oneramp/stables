"use client";

import BalancesCard from "@/components/balances-card";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Gift, Navigation } from "lucide-react";
import PageLayoutContainer from "@/components/page-layout-container";
import RecentTransactions from "@/components/recent-transactions";
import SendActionSheet from "@/components/send-action-sheet";
import ReceiveActionSheet from "@/components/receive-action-sheet";
import { useState } from "react";

export default function Home() {
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  return (
    <PageLayoutContainer>
      <Header />

      {/* Amount Display */}
      <BalancesCard />

      {/* Recent Transactions */}
      <div className="mt-8 mb-8">
        <RecentTransactions />
      </div>

      {/* Bottom Tabs */}
      <div className="w-full flex flex-row items-center justify-between gap-4 sticky bottom-0 z-10">
        <Button
          className="border-none w-full bg-black flex px-8 flex-row items-center justify-center rounded-full py-6 text-base"
          onClick={() => setIsSendOpen(true)}
        >
          Send
          <Navigation className="size-8 ml-2" />
        </Button>

        <Button
          className="border-none w-full bg-black flex px-8 flex-row items-center justify-center rounded-full py-6 text-base"
          onClick={() => setIsReceiveOpen(true)}
        >
          Receive
          <Gift className="size-8 ml-2" />
        </Button>
      </div>

      {/* Action Sheets */}
      <SendActionSheet
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
      />
      <ReceiveActionSheet
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
      />
    </PageLayoutContainer>
  );
}
