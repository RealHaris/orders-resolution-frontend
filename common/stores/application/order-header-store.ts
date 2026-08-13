import { proxy } from "valtio";

type OrderHeaderStoreState = {
  /** Customer name of the order currently open in the detail view. */
  customer?: string;
  update: {
    customer: (customer: string | undefined) => void;
  };
};

/**
 * Session-only client store backing the detail breadcrumb in the header.
 * The order detail island writes the customer name here so the
 * (server-chrome) header can render "Orders / <customer>'s orders".
 */
const orderHeaderStore = proxy<OrderHeaderStoreState>({
  customer: undefined,
  update: {
    customer: (customer: string | undefined) => {
      orderHeaderStore.customer = customer;
    },
  },
});

export default orderHeaderStore;
