import { type Address, type Abi } from "viem";

export type SupportedContractType = {
  name: string;
  abi: Abi;
  address: Address;
  decimals: number;
};
