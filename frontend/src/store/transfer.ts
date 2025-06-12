import { create } from "zustand";
import { TransferInResponseT } from "../../types";

interface TransferStore {
  transferData: TransferInResponseT | null;
  setTransferData: (data: TransferInResponseT | null) => void;
  clearTransferData: () => void;
}

export const useTransferStore = create<TransferStore>((set) => ({
  transferData: null,
  setTransferData: (data) => set({ transferData: data }),
  clearTransferData: () => set({ transferData: null }),
}));
