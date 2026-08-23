import { type HTMLAttributes } from "react";
import useScrambleText from "../hooks/useScrambleText";

interface ScrambleHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3";
  children: string;
  delay?: number;
}

export default function ScrambleHeading({
  as: Heading = "h1",
  children,
  delay = 360,
  ...props
}: ScrambleHeadingProps) {
  const label = useScrambleText(children, false, { autoPlay: "touch", delay });

  return (
    <Heading {...props} aria-label={children}>
      {label.visibleLabel}
    </Heading>
  );
}
