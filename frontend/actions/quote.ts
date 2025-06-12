"use server";

import OneRamp from "../oneramp";
import { PayBillQuoteT, QuoteT } from "../types";

export async function getQuoteIn(payload: QuoteT) {
  try {
    const response = await OneRamp.getQuote(payload);

    if (!response) {
      throw new Error("No response from OneRamp API");
    }

    return response;
  } catch (error) {
    // Re-throw the error with more context
    if (error instanceof Error) {
      throw new Error(`OneRamp API Error: ${error.message}`);
    }
    throw new Error("Failed to get quote from OneRamp API");
  }
}

export async function getQuoteOut(payload: QuoteT) {
  try {
    const response = await OneRamp.getQuoteOut(payload);

    if (!response) {
      throw new Error("No response from OneRamp API");
    }

    return response;
  } catch (error) {
    // Re-throw the error with more context
    if (error instanceof Error) {
      throw new Error(`OneRamp API Error: ${error.message}`);
    }
    throw new Error("Failed to get quote from OneRamp API");
  }
}

export async function getPayBillQuote(payload: PayBillQuoteT) {
  try {
    const response = await OneRamp.getPayBillQuote(payload);

    if (!response) {
      throw new Error("No response from OneRamp API");
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OneRamp API Error: ${error.message}`);
    }
    throw new Error("Failed to get pay bill quote from OneRamp API");
  }
}
