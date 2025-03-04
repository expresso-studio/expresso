import React from "react";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  className?: string;
  children: React.ReactNode;
}

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
