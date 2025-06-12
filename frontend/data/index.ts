import { CountryT, UserDetailsT } from "../types";

export const countries: Record<string, CountryT> = {
  KE: {
    name: "Kenya",
    currency: "KES",
    symbol: "KE",
    phoneCode: "254",
  },
  UG: {
    name: "Uganda",
    currency: "UGX",
    symbol: "UG",
    phoneCode: "256",
  },
};

export const MOCK_USER_DETAILS: UserDetailsT = {
  name: "JOVAN BALAMBIRWA MWESIGWA",
  country: "UG",
  address: "Plot 123, Kampala Road, Kampala",
  phone: "+256741629138",
  dob: "23/10/1997",
  idNumber: "CM9705210T3FEG",
  idType: "NIN",
  additionalIdType: "NIN",
  additionalIdNumber: "LICENCE",
};
