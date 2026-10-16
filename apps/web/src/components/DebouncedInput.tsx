import type React from "react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { Input } from "@jobtracker/ui/components/input";

interface DebouncedInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "onChange"
> {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
}

export const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: DebouncedInputProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const debouncedOnChange = useDebouncedCallback(onChange, { wait: debounce });

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        debouncedOnChange(e.target.value);
      }}
    />
  );
};
