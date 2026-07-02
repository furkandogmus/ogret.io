import { type InputHTMLAttributes, forwardRef, useState } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, icon, error, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== "";

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={`peer w-full rounded-xl border bg-background text-foreground transition-all outline-none ${
            icon ? "pl-10" : "pl-3.5"
          } pr-3.5 pt-5 pb-1.5 text-sm
          ${error ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-border focus:border-ring focus:ring-2 focus:ring-ring/15"}
          ${className || ""}`}
          placeholder=""
        />
        <label
          className={`absolute left-0 pointer-events-none transition-all duration-200 ${
            icon ? "left-10" : "left-3.5"
          } ${
            focused || hasValue
              ? "top-1.5 text-[10px] font-medium text-primary"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          }`}
        >
          {label}
        </label>
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";
