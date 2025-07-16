import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertBinCleaningAppointmentSchema } from "./schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BinCleaningAppointment } from "./schema";f
import { z } from "zod";

// Helper function to get next Monday or Thursday
const getNextMondayOrThursday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  let daysToAdd = 0;
  
  if (dayOfWeek === 0) { // Sunday
    daysToAdd = 1; // Next Monday
  } else if (dayOfWeek === 1) { // Monday
    daysToAdd = 0; // Today if it's Monday
  } else if (dayOfWeek === 2 || dayOfWeek === 3) { // Tuesday or Wednesday
    daysToAdd = 4 - dayOfWeek; // Next Thursday
  } else if (dayOfWeek === 4) { // Thursday
    daysToAdd = 0; // Today if it's Thursday
  } else { // Friday or Saturday
    daysToAdd = 8 - dayOfWeek; // Next Monday
  }
  
  const nextAvailableDate = new Date(today);
  nextAvailableDate.setDate(today.getDate() + daysToAdd);
  
  return nextAvailableDate.toISOString().split('T')[0];
};

const formSchema = insertBinCleaningAppointmentSchema.extend({
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  date: z.string().refine((dateStr) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, 4 = Thursday
    return dayOfWeek === 1 || dayOfWeek === 4; // Only Monday (1) or Thursday (4)
  }, {
    message: "Bin cleaning is only available on Mondays and Thursdays"
  }),
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
      date: appointment?.date || getNextMondayOrThursday(),
      startTime: "08:00", // Fixed start time
      endTime: "16:00", // Fixed end time
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
              <FormLabel>Date (Mondays and Thursdays only)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Service Schedule</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Available days: <strong>Mondays and Thursdays only</strong></p>
            <p>• Service time: <strong>8:00 AM - 4:00 PM</strong></p>
            <p>• Bins will be cleaned within this window</p>
          </div>
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
