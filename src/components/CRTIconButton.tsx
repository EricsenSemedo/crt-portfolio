import type { ButtonHTMLAttributes, ReactNode } from "react";
import useDirectionalFill from "../hooks/useDirectionalFill";

interface CRTIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
}

export default function CRTIconButton({
  children,
  label,
  className = "",
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: CRTIconButtonProps) {
  const fill = useDirectionalFill<HTMLButtonElement>();

  return (
    <button
      {...props}
      className={"crt-action-shell crt-action-shell--close group relative inline-flex cursor-pointer items-center justify-center overflow-hidden align-middle text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-crt-accent " + className}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        fill.handlePointerEnter(event);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        fill.handlePointerLeave(event);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (event.currentTarget.matches(":focus-visible")) fill.handleFocus();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        fill.handleBlur();
      }}
      aria-label={label}
      title={label}
    >
      <span
        className={"absolute inset-0 bg-white transition-transform duration-200 ease-out "
          + (fill.fillOrigin === "top" ? "origin-top " : "origin-bottom ")
          + (fill.fillVisible ? "scale-y-100" : "scale-y-0")}
        aria-hidden="true"
      />
      <span
        className={"crt-action-content relative z-10 flex items-center justify-center leading-none transition-colors "
          + (fill.fillVisible ? "text-[#111]" : "text-white")}
        aria-hidden="true"
      >
        {children}
      </span>
    </button>
  );
}
