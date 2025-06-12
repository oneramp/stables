"use client";

import BalancesCard from "@/components/balances-card";
import PageLayoutContainer from "@/components/page-layout-container";
import RecentTransactions from "@/components/recent-transactions";

export default function StakePage() {
  return (
    <PageLayoutContainer>
      {/* Amount Display */}
      <BalancesCard />

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Action Sheets */}
    </PageLayoutContainer>
  );
}
