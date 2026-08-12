import { OrderDetail } from "@/modules/Orders/OrderDetail";

/**
 * Protected order detail. `id` is passed into the client island.
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          <OrderDetail id={id} />
        </div>
      </div>
    </div>
  );
}
