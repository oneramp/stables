import { z } from "zod";
import { countries } from "../../../data";
import { COUNTRY } from "../../../constants";

export const quoteSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(?:254|\+254|0)?(7[0-9]{8})$/, {
      message: "Please enter a valid Kenyan phone number",
    })
    .transform((val) => {
      // Normalize phone number to international format (254...)
      const matched = val.match(/^(?:254|\+254|0)?(7[0-9]{8})$/);
      const country = countries[COUNTRY!];
      if (!matched) return val;
      return `${country.phoneCode}${matched[1]}`;
    }),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
