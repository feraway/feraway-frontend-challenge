import { type Address } from "viem";
const EVM_ADDRESS_REGEX = /^(0x)?[0-9a-fA-F]{40}$/;

export function isValidEvmAddress(address?: Address) {
  const evmRegexTester = new RegExp(EVM_ADDRESS_REGEX);
  return evmRegexTester.test(address || "");
}
