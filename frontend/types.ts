import { AssetTransfersCategory } from "alchemy-sdk";

export type QuoteT = {
  fiatType: string;
  cryptoType: string;
  network: string;
  fiatAmount: string;
  country: string;
  address: string;
};

export type CountryT = {
  name: string;
  currency: string;
  symbol: string;
  phoneCode: string;
};

export type UserDetailsT = {
  name: string;
  country: string;
  address: string;
  phone: string;
  dob: string;
  idNumber: string;
  idType: string;
  additionalIdType: string;
  additionalIdNumber: string;
};

export type TransferT = {
  phone: string;
  operator: string;
  quoteId: string;
  userDetails: UserDetailsT;
};

export type UserActionDetailsT = {
  accountName: string;
  accountNumber: string;
  institutionName: string;
  transactionReference: string;
  userActionType: string;
};

export type TransferInResponseT = {
  transferAddress: string;
  transferId: string;
  transferStatus: string;
  userActionDetails: UserActionDetailsT;
};

export type QuoteResponseT = {
  quote: {
    fiatType: string;
    cryptoType: string;
    fiatAmount: string;
    cryptoAmount: string;
    country: string;
    amountPaid: string;
    address: string;
    fee: string;
    guaranteedUntil: string;
    transferType: string;
    quoteId: string;
    network: string;
    used: boolean;
    requestType: string;
    id: string;
  };
  kyc: {
    kycRequired: boolean;
    kycSchemas: any[];
  };
  fiatAccount: {
    MobileMoney: {
      fiatAccountSchemas: any[];
      settlementTimeLowerBound: string;
      settlementTimeUpperBound: string;
    };
  };
};

export enum TransferStatus {
  TransferStarted = "TransferStarted",
  TransferComplete = "TransferComplete",
  TransferReceivedFiatFunds = "TransferReceivedFiatFunds",
  TransferFailed = "TransferFailed",
}

export type TransferOutResponseT = {
  transferId: string;
  transferStatus: TransferStatus;
  transferAddress: string;
};

export type SubmitOnChainTransactionHashT = {
  txHash: string;
  transferId: string;
};

export type TransactionStatusType =
  | "processing"
  | "success"
  | "cancelled"
  | "idle"
  | "pending"
  | "error";

export type PayBillQuoteT = {
  fiatType: string;
  cryptoType: string;
  region: string;
  fiatAmount: string;
  network: string;
  country: string;
  address: string;
  rawAmount: string;
};

export type PayBillTransferT = {
  quoteId: string;
  accountName: string;
  accountNumber: string;
  businessNumber: string;
};

export type FullQuoteResponseT = {
  quote: {
    fiatType: string;
    cryptoType: string;
    fiatAmount: string;
    cryptoAmount: string;
    country: string;
    amountPaid: string;
    address: string;
    fee: string;
    guaranteedUntil: string;
    transferType: string;
    quoteId: string;
    network: string;
    used: boolean;
    requestType: string;
    id: string;
  };
  kyc: {
    kycRequired: boolean;
    kycSchemas: any[];
  };
  fiatAccount: {
    MobileMoney: {
      fiatAccountSchemas: any[];
      settlementTimeLowerBound: string;
      settlementTimeUpperBound: string;
    };
  };
};

// {
//   "quote": {
//       "fiatType": "KES",
//       "cryptoType": "USDC",
//       "fiatAmount": "195",
//       "cryptoAmount": "1.464513706346226",
//       "country": "KE",
//       "amountPaid": "200",
//       "address": "0x240ef8C7Ae6eB6C1A80Da77F5586EeE76d50C589",
//       "fee": "0.03755163349605708",
//       "guaranteedUntil": "2025-06-13T00:12:09.093Z",
//       "transferType": "TransferIn",
//       "quoteId": "bd42d7de-4ad5-48ef-b6e7-29f57bc0c89c",
//       "network": "anvil",
//       "used": false,
//       "requestType": "fiat",
//       "id": "684b6cd92d8bb4c5163f8428"
//   },
//   "kyc": {
//       "kycRequired": true,
//       "kycSchemas": [
//           {
//               "kycSchema": "PersonalDataAndDocuments",
//               "allowedValues": {
//                   "isoCountryCode": [
//                       "UG",
//                       "KE"
//                   ],
//                   "isoRegionCode": [
//                       "UG",
//                       "KE"
//                   ]
//               }
//           }
//       ]
//   },
//   "fiatAccount": {
//       "MobileMoney": {
//           "fiatAccountSchemas": [
//               {
//                   "fiatAccountSchema": "MobileMoney",
//                   "userActionType": "AccountNumberUserAction",
//                   "allowedValues": {
//                       "country": [
//                           "UG",
//                           "KE"
//                       ]
//                   },
//                   "institutionName": "OneRamp",
//                   "accountName": "OneRamp",
//                   "accountNumber": "25656",
//                   "transactionReference": "ref-684b6cd92d8bb4c5163f8428"
//               }
//           ],
//           "settlementTimeLowerBound": "3600",
//           "settlementTimeUpperBound": "86400"
//       }
//   }
// }

export type AlchemyTransaction = {
  id: string;
  type: "send" | "receive" | "deposit" | "sell";
  amount: string;
  status: "success" | "pending" | "failed";
  date: string;
  from: string;
  to: string;
  blockNumber: bigint;
  category: AssetTransfersCategory;
};
