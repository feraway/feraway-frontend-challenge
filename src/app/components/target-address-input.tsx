import { formatUnits, type Address, maxUint256 } from "viem";
import { useAccount } from "wagmi";
import { OPERATIONS } from "@/lib/consts";
import { Input, Spinner } from "@/components/ui";
import { useStore } from "@/store";
import { isValidEvmAddress, truncateDecimals } from "@/lib/utils";
import { CheckboxWithText } from "@/components";
import { SupportedContractType } from "@/types";

type TargetAddressInputProps = {
  operationType?: OPERATIONS;
  selectedContract: SupportedContractType;
  allowanceLoading: boolean;
  allowance?: bigint;
};

export function TargetAddressInput(props: TargetAddressInputProps) {
  const { operationType, selectedContract, allowanceLoading, allowance } =
    props;
  const account = useAccount();
  const userAddress = account.address || null;
  const { targetAddress, setTargetAddress, contract } = useStore();
  const isTargetAddressValid = isValidEvmAddress(targetAddress);

  const isAllowanceMax =
    !!allowance &&
    formatUnits(allowance as bigint, selectedContract.decimals) ===
      formatUnits(maxUint256, selectedContract.decimals);

  return (
    <>
      <Input
        value={targetAddress || ""}
        disabled={
          !contract ||
          !operationType ||
          (operationType === OPERATIONS.MINT && targetAddress === userAddress)
        }
        onChange={(e) => setTargetAddress(e.target.value as Address)}
        className="max-w-96"
        placeholder="Please set a target address"
      />
      <div className="w-full flex flex-col items-center min-h-[40px]">
        {!!contract && !!targetAddress && !isTargetAddressValid && (
          <p className="text-red-700 mt-3">Please enter a valid EVM address</p>
        )}
        {operationType === OPERATIONS.MINT && (
          <div className="max-w-72 mt-5">
            <CheckboxWithText
              labelText="Mint for yourself?"
              checked={targetAddress === userAddress}
              onCheckedChange={(checked) => {
                if (checked) {
                  setTargetAddress(userAddress);
                } else {
                  setTargetAddress(null);
                }
              }}
            />
          </div>
        )}
        {operationType === OPERATIONS.ALLOWANCE &&
          !!targetAddress &&
          isTargetAddressValid && (
            <>
              <p className="mt-3 text-center">
                Current allowance for this address:{" "}
                {allowanceLoading ? (
                  <>
                    <Spinner size={2} /> {selectedContract.name}
                  </>
                ) : (
                  <>
                    {isAllowanceMax
                      ? "MAX"
                      : !!allowance || allowance === BigInt(0)
                      ? truncateDecimals(
                          formatUnits(
                            allowance as bigint,
                            selectedContract.decimals
                          )
                        )
                      : "---"}
                  </>
                )}{" "}
                {selectedContract.name}
              </p>
            </>
          )}
      </div>
    </>
  );
}
