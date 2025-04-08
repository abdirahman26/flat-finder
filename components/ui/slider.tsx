import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center",
  {
    variants: {
      size: {
        sm: "h-4",
        default: "h-5",
        lg: "h-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const thumbVariants = cva(
  "group block size-4 rounded-full bg-lime-300 shadow ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C851]/80 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative"
)

const trackVariants = cva("relative h-1 w-full grow overflow-hidden rounded-full bg-white/10")

const rangeVariants = cva("absolute h-full bg-lime-300")

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
  VariantProps<typeof sliderVariants> & {
    showBubble?: boolean
    value?: number[]
  }

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, size, value, showBubble = false, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(sliderVariants({ size }), className)}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track className={trackVariants()}>
        <SliderPrimitive.Range className={rangeVariants()} />
      </SliderPrimitive.Track>
      {value?.map((val, i) => (
        <SliderPrimitive.Thumb key={i} className={thumbVariants()}></SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
)

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider, sliderVariants }
