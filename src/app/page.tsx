"use client";
import { useState, useEffect } from "react";
import { Combobox } from "@/components/ui";
import {
  ConfirmationDialog,
  ErrorDialog,
  LastTransactionStatus,
} from "@/components";
import {
  ConnectWallet,
  SwitchNetwork,
  Title,
  Balance,
  SelectOperation,
  ConfirmOperationButton,
  TargetAddressInput,
  AmountInput,
} from "./components";
import { SUPPORTED_CONTRACTS_SEPOLIA, OPERATIONS } from "@/lib/consts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, type Address, erc20Abi } from "viem";
import { isValidEvmAddress, countDecimals } from "@/lib/utils";
import { useStore } from "@/store";
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
  const { targetAddress, contract, setContract } = useStore();
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
        isValidEvmAddress(targetAddress) &&
        !!account.address &&
        operationType === OPERATIONS.ALLOWANCE,
      refetchOnWindowFocus: false,
    },
  });

  const allowanceLoading = allowanceFetchStatus === "fetching";

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
  const isTransferAmountValid =
    !!balance &&
    !!amount &&
    (balance as bigint) >= parseUnits(amount, selectedContract.decimals);

  const isDecimalsValid =
    !!amount && countDecimals(amount) <= selectedContract.decimals;

  // Button validations
  const getIsButtonDisabled = () => {
    if (
      !contract ||
      !isValidEvmAddress(targetAddress) ||
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
        <SelectOperation
          onValueChange={(o) => setOperationType(o)}
          operationType={operationType}
          contract={contract}
        />
        <h2 className="text-2xl font-semibold mb-5 mt-7">Target Address:</h2>
        <TargetAddressInput
          allowanceLoading={allowanceLoading}
          operationType={operationType}
          selectedContract={selectedContract}
          allowance={allowance}
        />
        <h2 className="text-2xl font-semibold my-3">Amount:</h2>
        <AmountInput
          amount={amount}
          balance={balance}
          isDecimalsValid={isDecimalsValid}
          operationType={operationType}
          isTransferAmountValid={isTransferAmountValid}
          maxAllowanceChecked={maxAllowanceChecked}
          onChange={(e) => setAmount(e.target.value)}
          selectedContract={selectedContract}
          setMaxAllowanceChecked={setMaxAllowanceChecked}
        />
        <ConfirmOperationButton
          disabled={getIsButtonDisabled()}
          onClick={() => setConfirmationDialogOpen(true)}
          contract={contract}
          operationType={operationType}
        />
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
