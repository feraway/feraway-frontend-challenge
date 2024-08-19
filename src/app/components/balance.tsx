import { formatUnits } from "viem";
import { useStore } from "@/store";
import { Spinner } from "@/components/ui";
import { truncateDecimals } from "@/lib/utils";
import { SupportedContractType } from "@/types";

type BalancePropsType = {
  balanceLoading: boolean;
  balance?: bigint;
  selectedContract: SupportedContractType;
};

export function Balance(props: BalancePropsType) {
  const { balanceLoading, balance, selectedContract } = props;
  return (
    <h2 className="text-2xl font-semibold my-5 text-center text-wrap">
      Balance:{" "}
      {balanceLoading ? (
        <>
          <Spinner size={2} /> {selectedContract.name}
        </>
      ) : (
        <>
          {balance
            ? truncateDecimals(formatUnits(balance, selectedContract.decimals))
            : "---"}{" "}
          {selectedContract.name}
        </>
      )}
    </h2>
  );
}
