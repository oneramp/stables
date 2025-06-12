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
  TransferFailed = "TransferFailed",
}

export type TransferOutResponseT = {
  transferId: string;
  transferStatus: TransferStatus;
  transferAddress: string;
};
