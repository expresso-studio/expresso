import React from "react";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Renders a heading with a specific style.
 * @param props - The props for the Heading1 component.
 * @returns The rendered heading.
 */
const Heading1 = React.memo<Props>(function Heading1({
  id,
  className,
  children,
}) {
  return (
    <h1
      id={id}
      className={cn("text-2xl sm:text-4xl font-bold", className)}
      style={outfit.style}
    >
      {children}
    </h1>
  );
});

export default Heading1;
