import type React from "react"
import { forwardRef } from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // This is intentionally left empty
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = "", ...props }, ref) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"

