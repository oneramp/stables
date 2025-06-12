import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import {
  PayBillQuoteT,
  PayBillTransferT,
  QuoteT,
  SubmitOnChainTransactionHashT,
  TransferT,
} from "../types";

const ONERAMP_API_KEY = process.env.ONERAMP_API_KEY;
const ONERAMP_API_URL = process.env.ONERAMP_URL;

class OneRamp {
  private getHeaders(isTransferIn: boolean = false) {
    if (!ONERAMP_API_KEY) {
      throw new Error("OneRamp API key is not configured");
    }
    if (!ONERAMP_API_URL) {
      throw new Error("OneRamp API URL is not configured");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ONERAMP_API_KEY}`,
      ...(isTransferIn && {
        "Idempotency-Key": uuidv4(),
      }),
    };
  }

  private async makeRequest(
    endpoint: string,
    payload:
      | QuoteT
      | TransferT
      | SubmitOnChainTransactionHashT
      | PayBillTransferT,
    isTransferIn: boolean = false
  ) {
    try {
      const headers = this.getHeaders(isTransferIn);
      const response = await axios.post(
        `${ONERAMP_API_URL}${endpoint}`,
        payload,
        {
          headers: headers,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle API-specific errors
        if (error.response) {
          const data = error.response.data;
          const message =
            data.message || data.error || "An error occurred with the API";
          throw new Error(`OneRamp API Error: ${message}`);
        } else if (error.request) {
          throw new Error(
            "Could not reach OneRamp API. Please check your connection."
          );
        } else {
          throw new Error(`Error setting up request: ${error.message}`);
        }
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async makeGetRequest(endpoint: string) {
    try {
      const response = await axios.get(`${ONERAMP_API_URL}${endpoint}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle API-specific errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const data = error.response.data;
          const message =
            data.message || data.error || "An error occurred with the API";
          throw new Error(`OneRamp API Error: ${message}`);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error(
            "Could not reach OneRamp API. Please check your connection."
          );
        } else {
          // Something happened in setting up the request
          throw new Error(`Error setting up request: ${error.message}`);
        }
      }
      // Handle other errors
      throw new Error("An unexpected error occurred");
    }
  }

  async getQuote(payload: QuoteT) {
    // Validate payload before making request
    if (!payload.fiatAmount || Number(payload.fiatAmount) <= 0) {
      throw new Error("Invalid amount specified");
    }
    if (!payload.address) {
      throw new Error("Wallet address is required");
    }
    if (!payload.network) {
      throw new Error("Network is required");
    }
    if (!payload.country) {
      throw new Error("Country is required");
    }

    return this.makeRequest("/quote-in", payload);
  }

  async getQuoteOut(payload: QuoteT) {
    // Similar validation for quote-out
    if (!payload.fiatAmount || Number(payload.fiatAmount) <= 0) {
      throw new Error("Invalid amount specified");
    }
    if (!payload.address) {
      throw new Error("Wallet address is required");
    }
    if (!payload.network) {
      throw new Error("Network is required");
    }
    if (!payload.country) {
      throw new Error("Country is required");
    }

    return this.makeRequest("/quote-out", payload);
  }

  async getPayBillQuote(payload: PayBillQuoteT) {
    return this.makeRequest("/bill/quote", payload);
  }

  async createTransferIn(payload: TransferT) {
    return this.makeRequest("/kesc/transfer-in", payload, true);
  }

  async createTransferOut(payload: TransferT) {
    return this.makeRequest("/kesc/transfer-out", payload, true);
  }

  async createPayBillTransfer(payload: PayBillTransferT) {
    return this.makeRequest("/bill", payload, true);
  }

  async submitOnChainTransactionHash(payload: SubmitOnChainTransactionHashT) {
    return this.makeRequest("/kesc/tx", payload);
  }
}

export default new OneRamp();
