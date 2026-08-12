"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { CreateOrderSheet } from "@/modules/Orders/CreateOrderSheet";

type CreateOrderSheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CreateOrderSheetContext =
  createContext<CreateOrderSheetContextValue | null>(null);

/**
 * Shares create-order sheet state between the sidebar and dashboard island.
 */
export function CreateOrderSheetProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);

  /**
   * Opens or closes the sheet; remounts on each open so the form resets.
   */
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setSheetKey((current) => current + 1);
    }
    setOpen(next);
  };

  return (
    <CreateOrderSheetContext.Provider
      value={{ open, setOpen: handleOpenChange }}
    >
      {children}
      <CreateOrderSheet
        key={sheetKey}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </CreateOrderSheetContext.Provider>
  );
}

/**
 * Accesses create-order sheet open state. Must be used under the provider.
 */
export function useCreateOrderSheet(): CreateOrderSheetContextValue {
  const context = useContext(CreateOrderSheetContext);
  if (!context) {
    throw new Error(
      "useCreateOrderSheet must be used within CreateOrderSheetProvider",
    );
  }
  return context;
}
