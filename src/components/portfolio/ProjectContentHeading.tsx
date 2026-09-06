import ScrambleHeading from "../ScrambleHeading";

interface ProjectContentHeadingProps {
  title: string;
  category: string;
  className?: string;
  revealOnScroll?: boolean;
}

export default function ProjectContentHeading({
  title,
  category,
  className = "",
  revealOnScroll = true,
}: ProjectContentHeadingProps) {
  const revealClass = revealOnScroll ? "crt-scroll-reveal " : "";

  return (
    <header className={"pt-6 text-center sm:pt-8 " + className}>
      <ScrambleHeading
        as="h1"
        delay={180}
        className={revealClass + "mb-3 font-display text-3xl font-bold tracking-wide text-crt-accent-text"}
      >
        {title}
      </ScrambleHeading>
      <p className={revealClass + "font-mono text-lg text-crt-text-tertiary"}>{category}</p>
    </header>
  );
}
