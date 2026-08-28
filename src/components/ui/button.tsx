"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/utils";
import { buttonVariants, type ButtonVariantProps } from "./button-variants";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantProps;

export const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);
