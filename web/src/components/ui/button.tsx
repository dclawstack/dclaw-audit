import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#7030A0] text-white shadow-sm hover:bg-[#B180F8]",
        destructive: "bg-[#ed3c0d] text-white shadow-sm hover:bg-[#e6573f]",
        outline: "border-2 border-[#7030A0] bg-white text-[#7030A0] hover:bg-[#7030A0] hover:text-white",
        secondary: "bg-[#f7f7f7] text-[#444444] hover:bg-[#ededed]",
        ghost: "text-[#7030A0] hover:bg-purple-50 hover:text-[#682899]",
        link: "text-[#7030A0] underline-offset-4 hover:underline hover:text-[#682899]",
      },
      size: {
        default: "h-10 px-6 py-2 text-sm",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
