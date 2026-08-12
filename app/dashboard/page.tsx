import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { OrdersDashboard } from "@/modules/Orders/OrdersDashboard";

/**
 * Protected orders list. Data is fetched in the client island.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Suspense
            fallback={
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <OrdersDashboard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
