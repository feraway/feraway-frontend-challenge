import { type Address } from "viem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { OPERATIONS } from "@/lib/consts";

type SelectOperationProps = {
  operationType?: OPERATIONS;
  contract?: Address;
  onValueChange: (x: OPERATIONS) => void;
};

export function SelectOperation(props: SelectOperationProps) {
  const { operationType, contract, onValueChange } = props;

  return (
    <Select
      value={operationType}
      onValueChange={onValueChange}
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
  );
}
