import { cn } from "@/lib/utils";

/**
 * Right-aligned `current/max` character counter. Turns destructive when the
 * value exceeds the backend-enforced limit.
 */
export function CharacterCounter({
  value,
  max,
  className,
}: {
  value: string;
  max: number;
  className?: string;
}) {
  const count = value.length;
  return (
    <p
      className={cn(
        "text-right text-xs text-muted-foreground tabular-nums",
        count > max && "text-destructive",
        className,
      )}
    >
      {count}/{max}
    </p>
  );
}