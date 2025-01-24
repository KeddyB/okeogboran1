import type React from "react"
import { forwardRef } from "react"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  // This is intentionally left empty
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className = "", ...props }, ref) => {
  return <label ref={ref} className={`block text-sm font-medium text-gray-700 ${className}`} {...props} />
})

Label.displayName = "Label"

