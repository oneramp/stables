"use server";

import OneRamp from "../oneramp";
import { TransferInT } from "../types";

export async function createTransferIn(payload: TransferInT) {
  try {
    const response = await OneRamp.createTransferIn(payload);

    if (!response) {
      throw new Error("No response from OneRamp API");
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OneRamp API Error: ${error}`);
    }
    throw new Error("Failed to create transfer in");
  }
}
