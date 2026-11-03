import { Card, Skeleton } from "@heroui/react";

export function ImovelCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden p-0">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <Skeleton className="mt-2 h-7 w-1/3 rounded-md" />
      </div>
    </Card>
  );
}
