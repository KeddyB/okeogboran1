import type React from "react"
import { forwardRef } from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = "", label, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</label>}
      <textarea
        className={`w-full px-3 py-2 text-gray-700 dark:text-gray-200 border rounded-lg focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 ${className}`}
        ref={ref}
        {...props}
      />
    </div>
  )
})

Textarea.displayName = "Textarea"

