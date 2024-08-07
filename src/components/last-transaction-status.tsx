import Link from "next/link";
import { SquareCheckBig, RefreshCcw, CircleX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type LastTransactionStatusProps = {
  isLoading: boolean;
  txHash?: string;
  error?: string;
  confirmed: boolean;
};

export function LastTransactionStatus(props: LastTransactionStatusProps) {
  const { isLoading, txHash, error, confirmed } = props;

  return (
    <Alert
      variant={
        isLoading
          ? "loading"
          : error
          ? "destructive"
          : confirmed
          ? "success"
          : "default"
      }
    >
      {isLoading ? (
        <RefreshCcw className="h-4 w-4" />
      ) : error ? (
        <CircleX className="h-4 w-4" />
      ) : (
        <SquareCheckBig className="h-4 w-4" />
      )}
      <AlertTitle>
        Last transaction{" "}
        {isLoading
          ? "pending"
          : error
          ? "failed"
          : confirmed
          ? "confirmed"
          : "details"}
      </AlertTitle>
      <AlertDescription>
        {isLoading
          ? "Your last transaction is being processed, your balance or allowance will be updated once it finishes."
          : error
          ? `Your las transaction failed. Error: "${error}"`
          : confirmed
          ? ""
          : "Once you make a transaction, details will appear here"}
        {""}{" "}
        {txHash && (isLoading || error || confirmed) && (
          <>
            <p className="mt-3">Link to transaction:</p>
            <Link
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              className="underline inline-block break-all mt-1"
              role="lastTxHash"
            >
              {txHash}
            </Link>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
