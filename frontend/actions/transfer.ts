"use server";

import OneRamp from "../oneramp";
import { SubmitOnChainTransactionHashT, TransferT } from "../types";

export async function createTransferIn(payload: TransferT) {
  try {
    const response = await OneRamp.createTransferIn(payload);

    if (!response) {
      throw new Error("No response from OneRamp API");
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OneRamp API Error: ${error.message}`);
    }
    throw new Error("Failed to create transfer in");
  }
}

export async function createTransferOut(payload: TransferT) {
  try {
    const response = await OneRamp.createTransferOut(payload);

    if (!response) {
      throw new Error("No response from OneRamp API");
    }

    return response;
  } catch (error) {
    // If it's already an Error from OneRamp, pass it through
    if (
      error instanceof Error &&
      error.message.includes("OneRamp API Error:")
    ) {
      throw error;
    }
    // For other errors, wrap them appropriately
    if (error instanceof Error) {
      throw new Error(`OneRamp API Error: ${error.message}`);
    }
    throw new Error("Failed to create transfer out");
  }
}

export async function getTransfer(transferId: string) {
  try {
    if (!transferId) {
      return {
        status: "error",
        message: "Transfer ID is required",
      };
    }

    const response = await OneRamp.makeGetRequest(`/transfer/${transferId}`);

    if (!response) {
      throw new Error("No response from OneRamp API");
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OneRamp API Error: ${error.message}`);
    }
    throw new Error("Failed to get transfer status");
  }
}

export async function submitOnChainTransactionHash(
  payload: SubmitOnChainTransactionHashT
) {
  try {
    const response = await OneRamp.submitOnChainTransactionHash(payload);

    if (!response) {
      throw new Error("No response from OneRamp API");
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OneRamp API Error: ${error.message}`);
    }
  }
}
