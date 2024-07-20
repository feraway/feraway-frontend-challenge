import WT6_USDC_ABI from "@/lib/abis/WT6_USDC.json";
import WT18_DAI_ABI from "@/lib/abis/WT18_DAI.json";

export const SUPPORTED_CONTRACTS_SEPOLIA = {
  ["0x1D70D57ccD2798323232B2dD027B3aBcA5C00091"]: {
    name: "WT18_DAI",
    abi: WT18_DAI_ABI,
    address: "0x1D70D57ccD2798323232B2dD027B3aBcA5C00091",
    decimals: 18,
  },
  ["0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47"]: {
    name: "WT6_USDC",
    abi: WT6_USDC_ABI,
    address: "0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47",
    decimals: 6,
  },
};
