import React from "react";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: string;
  className: string;
  children: React.ReactNode;
}

const Section = React.memo<Props>(function Section({
  id,
  title,
  className,
  children,
}) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <h2 id={id} className="text-l sm:text-2xl font-bold" style={outfit.style}>
        {title}
      </h2>
      <div
        className={cn(`rounded-lg bg-lightGray overflow-hidden p-6`, className)}
      >
        {children}
      </div>
    </div>
  );
});

export default Section;
