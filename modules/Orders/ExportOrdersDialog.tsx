"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { DatePicker } from "@/common/components/shared/DatePicker/DatePicker";
import { exportOrdersCsv } from "@/common/rest-api-calls/application/orders";
import { todayUtcDateInput } from "@/common/utils/date";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const exportFormSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine((value) => value.startDate <= value.endDate, {
    message: "Start date must be on or before end date",
    path: ["endDate"],
  });

type ExportFormValues = z.infer<typeof exportFormSchema>;

/**
 * Triggers a browser download from a CSV blob.
 */
const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Date-range CSV export dialog. Downloads via blob because the API needs cookies.
 */
export function ExportOrdersDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      startDate: todayUtcDateInput(),
      endDate: todayUtcDateInput(),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ExportFormValues) =>
      exportOrdersCsv({
        startDate: values.startDate,
        endDate: values.endDate,
        fileName: `orders-${values.startDate}-to-${values.endDate}`,
      }),
    onSuccess: (blob, values) => {
      downloadBlob(blob, `orders-${values.startDate}-to-${values.endDate}.csv`);
      onOpenChange(false);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export orders</DialogTitle>
          <DialogDescription>
            Download a CSV of your orders created in this date range.
          </DialogDescription>
        </DialogHeader>
        <form id="export-orders-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.startDate || undefined}>
              <FieldLabel htmlFor="export-start">Start date</FieldLabel>
              <Controller
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    id="export-start"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.startDate]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.endDate || undefined}>
              <FieldLabel htmlFor="export-end">End date</FieldLabel>
              <Controller
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker
                    id="export-end"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.endDate]} />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="export-orders-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Exporting…" : "Download CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
