"use client";

import BalancesCard from "@/components/balances-card";
import PageLayoutContainer from "@/components/page-layout-container";
import RecentTransactions from "@/components/recent-transactions";

export default function PayPage() {
  return (
    <PageLayoutContainer>
      {/* Amount Display */}
      <BalancesCard pay />

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Bottom Tabs */}
      {/* Action Sheets */}
    </PageLayoutContainer>
  );
}
