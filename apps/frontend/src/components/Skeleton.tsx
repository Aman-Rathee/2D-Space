import { cn } from "../utils/cnUtil"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            className={cn("bg-gray-300 animate-pulse rounded-xl", className)}
            {...props}
        />
    )
}

export { Skeleton }
