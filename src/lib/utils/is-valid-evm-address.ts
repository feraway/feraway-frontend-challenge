import { type Address, isAddress } from "viem";

export function isValidEvmAddress(address?: Address | null) {
  if (!address) return false;
  return isAddress(address);
}
