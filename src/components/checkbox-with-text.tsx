"use client";

import { type Dispatch, type SetStateAction } from "react";
import { Checkbox } from "@/components/ui";

type CheckboxWithTextProps = {
  labelText: string;
  secondaryText?: string;
  checked: boolean | "indeterminate";
  onCheckedChange: Dispatch<SetStateAction<boolean | "indeterminate">>;
};

export function CheckboxWithText(props: CheckboxWithTextProps) {
  const { labelText, secondaryText, checked, onCheckedChange } = props;
  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id="terms1"
        defaultChecked={false}
        onCheckedChange={onCheckedChange}
        checked={checked}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms1"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {labelText}
        </label>
        {secondaryText && (
          <p
            className="text-sm text-muted-foreground"
            data-testid="checkbox-secondary-text"
          >
            {secondaryText}
          </p>
        )}
      </div>
    </div>
  );
}
