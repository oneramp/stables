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

export type TransferInT = {
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
