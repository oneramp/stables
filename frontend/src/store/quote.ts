import { create } from "zustand";
import { QuoteResponseT } from "../../types";

interface QuoteStore {
  quoteData: QuoteResponseT | null;
  setQuoteData: (data: QuoteResponseT | null) => void;
  clearQuoteData: () => void;
}

export const useQuoteStore = create<QuoteStore>((set) => ({
  quoteData: null,
  setQuoteData: (data) => set({ quoteData: data }),
  clearQuoteData: () => set({ quoteData: null }),
}));
