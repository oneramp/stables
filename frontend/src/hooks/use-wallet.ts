import { create } from "zustand";

interface WalletState {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const useWallet = create<WalletState>((set) => ({
  isConnected: false,
  connect: () => set({ isConnected: true }),
  disconnect: () => set({ isConnected: false }),
}));

export default useWallet;
