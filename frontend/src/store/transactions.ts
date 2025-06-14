import { create } from "zustand";

interface TransactionRefreshState {
  refreshCount: number;
  refreshTransactions: () => void;
}

export const useTransactionRefreshStore = create<TransactionRefreshState>(
  (set) => ({
    refreshCount: 0,
    refreshTransactions: () =>
      set((state) => ({ refreshCount: state.refreshCount + 1 })),
  })
);
