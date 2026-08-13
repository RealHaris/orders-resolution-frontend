"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSnapshot } from "valtio";

import orderHeaderStore from "@/common/stores/application/order-header-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * List title or detail breadcrumb based on the current dashboard path.
 */
export function DashboardHeaderTitle() {
  const pathname = usePathname();
  const { customer } = useSnapshot(orderHeaderStore);
  const isDetail = pathname !== "/orders" && pathname.startsWith("/orders/");

  if (!isDetail) {
    return <span>Orders Resolution</span>;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/orders" />}>
            Orders
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {customer ? `${customer}'s orders` : "Order"}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
