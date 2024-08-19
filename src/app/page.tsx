"use client";
import { useState, useEffect } from "react";
import {
  Combobox,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/components/ui";
import {
  ConfirmationDialog,
  ErrorDialog,
  CheckboxWithText,
  LastTransactionStatus,
} from "@/components";
import { ConnectWallet, SwitchNetwork, Title, Balance } from "./components";
import { SUPPORTED_CONTRACTS_SEPOLIA, OPERATIONS } from "@/lib/consts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  formatUnits,
  parseUnits,
  type Address,
  erc20Abi,
  isAddress,
} from "viem";
import {
  isValidEvmAddress,
  countDecimals,
  truncateDecimals,
} from "@/lib/utils";
import { useStore } from "@/store";
import { maxUint256 } from "viem";
import { useConfirmTransaction } from "@/lib/hooks";
import { CheckedStateType } from "@/types";

const comboboxOptions = Object.keys(SUPPORTED_CONTRACTS_SEPOLIA).map(
  (contract) => ({
    value: contract,
    label:
      SUPPORTED_CONTRACTS_SEPOLIA[
        contract as keyof typeof SUPPORTED_CONTRACTS_SEPOLIA
      ].name,
  })
);

export default function Home() {
  const account = useAccount();
  const chainId = useChainId();
  const { targetAddress, setTargetAddress, contract, setContract } = useStore();
  const [amount, setAmount] = useState("");
  const [operationType, setOperationType] = useState<OPERATIONS>();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [maxAllowanceChecked, setMaxAllowanceChecked] =
    useState<CheckedStateType>(false);

  const selectedContract = contract
    ? SUPPORTED_CONTRACTS_SEPOLIA[
        contract as keyof typeof SUPPORTED_CONTRACTS_SEPOLIA
      ]
    : SUPPORTED_CONTRACTS_SEPOLIA["0x1D70D57ccD2798323232B2dD027B3aBcA5C00091"];

  const {
    confirmTransaction,
    confirmationDialogText,
    writeContractStatus,
    writeContractTxHash,
    writeContractError,
  } = useConfirmTransaction({
    operationType,
    selectedContract,
    targetAddress,
    amount,
    maxAllowanceChecked,
  });

  const writeContractLoading = writeContractStatus === "pending";

  const { data: { blockHash } = {}, fetchStatus: txReceiptFetchStatus } =
    useWaitForTransactionReceipt({
      hash: writeContractTxHash,
      query: {
        refetchOnWindowFocus: false,
      },
    });

  const txReceiptLoading = txReceiptFetchStatus === "fetching";

  const {
    data: balance,
    refetch: refetchBalance,
    fetchStatus: balanceFetchStatus,
  } = useReadContract({
    address: selectedContract.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address as Address],
    query: {
      enabled: !!contract && !!account.address,
      refetchOnWindowFocus: false,
    },
  });

  const balanceLoading = balanceFetchStatus === "fetching";

  const lastTransactionLoading = writeContractLoading || txReceiptLoading;

  const {
    data: allowance,
    refetch: refetchAllowance,
    fetchStatus: allowanceFetchStatus,
  } = useReadContract({
    address: selectedContract.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account.address as Address, targetAddress as Address],
    query: {
      enabled:
        !!contract &&
        !!targetAddress &&
        isAddress(targetAddress) &&
        !!account.address &&
        operationType === OPERATIONS.ALLOWANCE,
      refetchOnWindowFocus: false,
    },
  });

  const allowanceLoading = allowanceFetchStatus === "fetching";

  const isAllowanceMax =
    allowance &&
    formatUnits(allowance as bigint, selectedContract.decimals) ===
      formatUnits(maxUint256, selectedContract.decimals);

  useEffect(() => {
    if (writeContractStatus === "error") {
      setErrorMessage(
        (writeContractError as { shortMessage?: string })?.shortMessage ||
          "An error ocurred"
      );
      setErrorDialogOpen(true);
    } else {
      setErrorMessage("");
    }
  }, [writeContractStatus, writeContractError]);

  useEffect(() => {
    setMaxAllowanceChecked(false);
  }, [operationType]);

  useEffect(() => {
    if (blockHash) {
      if (
        operationType === OPERATIONS.TRANSFER ||
        operationType === OPERATIONS.MINT
      ) {
        refetchBalance();
      }
      if (operationType === OPERATIONS.ALLOWANCE) {
        refetchAllowance();
      }
    }
  }, [blockHash, operationType, refetchBalance, refetchAllowance]);

  // Input validations
  const isTargetAddressValid =
    !!targetAddress && isValidEvmAddress(targetAddress);
  const isTransferAmountValid =
    !!balance &&
    !!amount &&
    (balance as bigint) >= parseUnits(amount, selectedContract.decimals);

  const showTransferAmountError =
    !!contract &&
    !!balance &&
    !!amount &&
    !isTransferAmountValid &&
    operationType === OPERATIONS.TRANSFER;

  const isDecimalsValid =
    !!amount && countDecimals(amount) <= selectedContract.decimals;

  // Buttons validations
  const getIsButtonDisabled = () => {
    if (
      !contract ||
      !isTargetAddressValid ||
      (!isDecimalsValid && !maxAllowanceChecked)
    ) {
      return true;
    }
    if (operationType === OPERATIONS.TRANSFER && !isTransferAmountValid) {
      return true;
    }
    if (
      operationType === OPERATIONS.ALLOWANCE &&
      !amount &&
      !maxAllowanceChecked
    ) {
      return true;
    }
    return false;
  };

  const userAddress = account.address || null;

  if (!userAddress) {
    return <ConnectWallet />;
  }

  if (account.chainId !== chainId) {
    return <SwitchNetwork />;
  }

  return (
    <>
      <header className="flex justify-end p-1">
        <ConnectButton />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-start p-11">
        <Title />
        <p className="max-w-96 text-center mb-5">
          Please select a token from the list to operate with
        </p>
        <Combobox
          options={comboboxOptions}
          itemName="token"
          value={contract}
          setValue={(x) => setContract(x as Address)}
          role="combobox-token"
        />
        <Balance
          balanceLoading={balanceLoading}
          balance={balance}
          selectedContract={selectedContract}
        />

        <p className="mb-5">What would you like to do?</p>
        <Select
          value={operationType}
          onValueChange={(o: OPERATIONS) => setOperationType(o)}
          disabled={!contract}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an Operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={OPERATIONS.TRANSFER}>Transfer Tokens</SelectItem>
            <SelectItem value={OPERATIONS.ALLOWANCE}>Set Allowance</SelectItem>
            <SelectItem value={OPERATIONS.MINT}>Mint Tokens</SelectItem>
          </SelectContent>
        </Select>
        <h2 className="text-2xl font-semibold mb-5 mt-7">Target Address:</h2>
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
            <p className="text-red-700 mt-3">
              Please enter a valid EVM address
            </p>
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
        <h2 className="text-2xl font-semibold my-3">Amount:</h2>
        <Input
          type="number"
          className="max-w-96 mb-1"
          disabled={!contract || !operationType || !!maxAllowanceChecked}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Please set an amount"
        />
        <div className="w-full flex flex-col items-center min-h-[40px]">
          {operationType === OPERATIONS.ALLOWANCE && (
            <div className="max-w-72 mt-5">
              <CheckboxWithText
                labelText="Use max allowance?"
                secondaryText="By giving an address max allowance they have control over all your funds for the desired token"
                checked={maxAllowanceChecked}
                onCheckedChange={setMaxAllowanceChecked}
              />
            </div>
          )}
          {showTransferAmountError && (
            <p className="text-red-700 mt-3">
              Your transfer amount is larger than your balance
            </p>
          )}
          {!!amount && !isDecimalsValid && (
            <p className="text-red-700 mt-3">
              You are using more decimals than your contract allows. Limit:{" "}
              {selectedContract.decimals}
            </p>
          )}
        </div>
        <div className="my-7 w-96 flex justify-center">
          {operationType && (
            <Button
              disabled={getIsButtonDisabled()}
              onClick={() => setConfirmationDialogOpen(true)}
              role="confirm-button"
            >
              {operationType === OPERATIONS.ALLOWANCE
                ? "Set Allowance"
                : operationType === OPERATIONS.TRANSFER
                ? "Send Tokens"
                : operationType === OPERATIONS.MINT
                ? "Confirm Mint"
                : null}
            </Button>
          )}
          {(!operationType || !contract) && (
            <Button disabled>
              {!contract
                ? "Please select a token"
                : !operationType
                ? "Please select an operation to perform"
                : ""}
            </Button>
          )}
        </div>
        <div className="md:w-[38rem] sm:w-full">
          <LastTransactionStatus
            isLoading={lastTransactionLoading}
            txHash={writeContractTxHash}
            error={errorMessage}
            confirmed={!!blockHash}
          />
        </div>
      </main>

      <ConfirmationDialog
        title={confirmationDialogText.title}
        description={confirmationDialogText.description}
        open={confirmationDialogOpen}
        onConfirm={() => {
          confirmTransaction();
          setAmount("");
          setConfirmationDialogOpen(false);
        }}
        onCancel={() => setConfirmationDialogOpen(false)}
      />
      <ErrorDialog
        open={errorDialogOpen}
        description={errorMessage}
        onConfirm={() => {
          setErrorDialogOpen(false);
        }}
      />
    </>
  );
}
