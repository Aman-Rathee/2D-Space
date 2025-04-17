import { cn } from "../utils/cnUtil"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            className={cn("bg-foreground-200/50 animate-pulse rounded-lg", className)}
            {...props}
        />
    )
}

export { Skeleton }
