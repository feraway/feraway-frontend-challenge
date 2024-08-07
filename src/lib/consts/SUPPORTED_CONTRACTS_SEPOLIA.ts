import { type Address } from "viem";
import { SupportedContractType } from "@/types";

type SupportedContractsType = Record<Address, SupportedContractType>;

export const SUPPORTED_CONTRACTS_SEPOLIA: SupportedContractsType = {
  ["0x1D70D57ccD2798323232B2dD027B3aBcA5C00091"]: {
    name: "WT18_DAI",
    address: "0x1D70D57ccD2798323232B2dD027B3aBcA5C00091",
    decimals: 18,
  },
  ["0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47"]: {
    name: "WT6_USDC",
    address: "0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47",
    decimals: 6,
  },
};
