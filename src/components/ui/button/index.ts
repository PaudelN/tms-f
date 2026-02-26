import { cva, type VariantProps } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        header:
          "bg-primary-20 text-primary hover:text-foreground hover:bg-background cursor-pointer rounded-[9999999px]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-7 w-7",
      },
      // ── Shape controls rounding independently of size/variant ──
      shape: {
        default: "rounded-md",
        square: "rounded-sm",
        pill: "rounded-full",
        circle: "rounded-[999999px]", // identical to rounded-full but explicit
        none: "rounded-none",
      },
    },
    // Default shape is "default" so existing usages are unaffected
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
