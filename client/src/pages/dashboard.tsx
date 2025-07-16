import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, DollarSign, SprayCan, Droplets, MessageSquare, Clock, CheckCircle, Circle } from "lucide-react";
import type { Customer, BinCleaningAppointment, Message } from "@shared/schema";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: binCleaningAppointments } = useQuery<BinCleaningAppointment[]>({
    queryKey: ["/api/bin-cleaning"],
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Generate week view for calendar
  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Calculate revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenue = binCleaningAppointments
    ?.filter(a => {
      const appointmentDate = new Date(a.date);
      return appointmentDate.getMonth() === currentMonth && 
             appointmentDate.getFullYear() === currentYear &&
             a.status === 'completed';
    })
    .reduce((sum, a) => sum + a.price, 0) || 0;

  const totalRevenue = binCleaningAppointments
    ?.filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0) || 0;

  const getAppointmentsForDay = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return binCleaningAppointments?.filter(a => a.date === dayStr) || [];
  };

  const markMessageAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest("PATCH", `/api/messages/${messageId}`, { status: 'read' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Message marked as read",
        description: "The message has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message status.",
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar size={16} />
            Services Calendar
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users size={16} />
            Customer List
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Messages
            {messages && messages.filter(m => m.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                {messages.filter(m => m.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign size={16} />
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Services</CardTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                >
                  Previous Week
                </Button>
                <span className="font-medium">
                  {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  Next Week
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day) => {
                  const appointments = getAppointmentsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-4 border rounded-lg ${
                        isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900 mb-2">
                        {format(day, 'EEE d')}
                      </div>
                      <div className="space-y-2">
                        {appointments.length === 0 ? (
                          <p className="text-xs text-gray-500">No services</p>
                        ) : (
                          appointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className="p-2 rounded text-xs bg-white border"
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {appointment.serviceType === 'bin_cleaning' ? (
                                  <SprayCan size={12} className="text-blue-600" />
                                ) : (
                                  <Droplets size={12} className="text-purple-600" />
                                )}
                                <span className="font-medium">
                                  {appointment.serviceType === 'bin_cleaning' ? 'Bin Clean' : 'Pressure Wash'}
                                </span>
                              </div>
                              <p className="text-gray-600">{appointment.customerName}</p>
                              <p className="text-gray-600">${appointment.price}</p>
                              <Badge
                                variant={
                                  appointment.status === 'completed' ? 'default' :
                                  appointment.status === 'in_progress' ? 'secondary' :
                                  'outline'
                                }
                                className="mt-1"
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
              <p className="text-sm text-gray-600">
                Total: {customers?.length || 0} customers
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No customers found</p>
                ) : (
                  customers?.map((customer) => (
                    <div key={customer.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          <p className="text-sm text-gray-500 mt-1">{customer.address}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            Route {customer.routeId || 'Unassigned'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-2">
                            Joined {customer.createdAt ? format(new Date(customer.createdAt), 'MMM d, yyyy') : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                Client Messages
              </CardTitle>
              <p className="text-sm text-gray-600">
                Messages from your customers through the customer portal
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages && messages.length > 0 ? (
                  messages
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 rounded-lg border ${
                          message.status === 'pending' 
                            ? 'border-blue-200 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900">{message.customerName}</p>
                              <Badge 
                                variant={message.status === 'pending' ? 'destructive' : 'default'}
                                className="text-xs"
                              >
                                {message.status === 'pending' ? 'New' : 'Read'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {message.subject}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-3">{message.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {message.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markMessageAsReadMutation.mutate(message.id)}
                                disabled={markMessageAsReadMutation.isPending}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle size={14} />
                                {markMessageAsReadMutation.isPending ? 'Updating...' : 'Mark Read'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500">
                      Customer messages from the portal will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">${monthlyRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <SprayCan className="text-purple-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Services Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {binCleaningAppointments?.filter(a => a.status === 'completed').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {binCleaningAppointments
                  ?.filter(a => a.status === 'completed')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.serviceType === 'bin_cleaning' ? 'Bin Cleaning' : 'Pressure Washing'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${appointment.price.toFixed(2)}</p>
                        <Badge variant="default">Completed</Badge>
                      </div>
                    </div>
                  )) || (
                  <p className="text-gray-500 text-center py-8">No completed services found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
