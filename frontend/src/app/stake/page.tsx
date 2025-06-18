"use client";

import PageLayoutContainer from "@/components/page-layout-container";
import RecentTransactions from "@/components/recent-transactions";
import StakeBalances from "./stake-balances";

export default function StakePage() {
  return (
    <PageLayoutContainer>
      {/* Amount Display */}
      <StakeBalances />

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Action Sheets */}
    </PageLayoutContainer>
  );
}
