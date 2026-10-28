import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const buttonVariants = cva("btn", {
  variants: {
    variant: { outline: "", primary: "btn-primary" },
    rounded: { true: "rounded-full", false: "" },
  },
  defaultVariants: { variant: "primary", rounded: false },
});

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };
export function Button({
  className,
  variant,
  rounded,
  asChild,
  ...props
}: Props) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(buttonVariants({ variant, rounded }), className)}
      {...props}
    />
  );
}
