import { type Address } from "viem";

export type SupportedContractType = {
  name: string;
  address: Address;
  decimals: number;
};
