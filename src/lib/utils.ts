import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function valueUpdater<T>(updaterOrValue: T | ((old: T) => T), target: { value: T }) {
  if (typeof updaterOrValue === "function") {
    target.value = (updaterOrValue as (old: T) => T)(target.value);
  } else {
    target.value = updaterOrValue;
  }
}
