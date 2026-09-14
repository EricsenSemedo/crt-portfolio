import type { ButtonHTMLAttributes, ReactNode } from "react";
import useScrambleText from "../hooks/useScrambleText";
import useDirectionalFill from "../hooks/useDirectionalFill";

interface CRTIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  text?: string;
  variant?: "neutral" | "accent";
}

export default function CRTIconButton({
  children,
  label,
  text,
  variant = "neutral",
  className = "",
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: CRTIconButtonProps) {
  const textLabel = useScrambleText(text ?? "", !text, { autoPlay: "touch", delay: 300 });
  const fill = useDirectionalFill<HTMLButtonElement>();

  const accent = variant === "accent";

  return (
    <button
      type="button"
      {...props}
      className={"min-h-11 min-w-11 crt-action-shell crt-action-shell--close group relative inline-flex cursor-pointer items-center justify-center overflow-hidden align-middle text-white focus:outline-none focus:ring-2 focus:ring-inset "
        + (accent ? "border-r border-white/30 bg-crt-accent focus:ring-crt-overlay " : "focus:ring-crt-accent ") + className}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") textLabel.scramble();
        fill.handlePointerEnter(event);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        fill.handlePointerLeave(event);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (event.currentTarget.matches(":focus-visible")) {
          textLabel.scramble();
          fill.handleFocus();
        }
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
        {text && <span className="ml-2 font-mono text-sm font-semibold">{textLabel.visibleLabel}</span>}
      </span>
    </button>
  );
}
