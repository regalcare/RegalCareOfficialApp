import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertBinCleaningAppointmentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BinCleaningAppointment } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBinCleaningAppointmentSchema.extend({
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
});

type FormData = z.infer<typeof formSchema>;

interface CleaningFormProps {
  appointment?: BinCleaningAppointment | null;
  onSuccess: () => void;
}

export default function CleaningForm({ appointment, onSuccess }: CleaningFormProps) {
  const { toast } = useToast();
  const isEdit = !!appointment;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: appointment?.customerId || null,
      customerName: appointment?.customerName || "",
      address: appointment?.address || "",
      date: appointment?.date || "",
      startTime: appointment?.startTime || "",
      endTime: appointment?.endTime || "",
      binCount: appointment?.binCount || 1,
      price: appointment?.price || 2500, // $25.00 in cents
      status: appointment?.status || "scheduled",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEdit ? `/api/bin-cleaning/${appointment!.id}` : "/api/bin-cleaning";
      const method = isEdit ? "PUT" : "POST";
      await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bin-cleaning"] });
      toast({
        title: "Success",
        description: `Appointment ${isEdit ? "updated" : "created"} successfully`,
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} appointment`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createAppointmentMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter customer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="binCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Bins</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter number of bins"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (in cents)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter price in cents (e.g., 2500 for $25.00)"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={createAppointmentMutation.isPending}>
            {createAppointmentMutation.isPending ? "Saving..." : isEdit ? "Update Appointment" : "Create Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
