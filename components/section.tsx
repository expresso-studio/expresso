import React from "react";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Props {
  id: string;
  title: string;
  link?: string;
  className?: string;
  children?: React.ReactNode;
}

const Section = React.memo<Props>(function Section({
  id,
  title,
  link,
  className,
  children,
}) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <h2 id={id} className="text-l sm:text-2xl font-bold" style={outfit.style}>
        {link ? (
          <Link className="flex w-full gap-2 group" href={link}>
            {title}
            <ArrowUpRight className="-translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-200" />
          </Link>
        ) : (
          title
        )}
      </h2>
      <div
        className={cn(
          `rounded-lg bg-lightGray dark:bg-darkGray relative overflow-hidden p-6`,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
});

export default Section;
