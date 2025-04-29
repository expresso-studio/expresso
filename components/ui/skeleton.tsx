import { cn } from "@/lib/utils";

/**
 * Renders a skeleton loading state.
 * @param props - The props for the Skeleton component.
 * @returns The rendered skeleton component.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-stone-100 dark:bg-stone-800",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
