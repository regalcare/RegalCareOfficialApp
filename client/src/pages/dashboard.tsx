import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Users, DollarSign, SprayCan, Droplets, MessageSquare, Clock, CheckCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Customer, BinCleaningAppointment, Message } from "./schema";
import { format, addDays, startOfWeek, isSameDay, startOfMonth, endOfMonth, getDaysInMonth, getDay } from "date-fns";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
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

  // Generate monthly calendar view
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = getDaysInMonth(selectedDate);
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday
  
  // Create array of all calendar days (including prev/next month days for full grid)
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(addDays(monthStart, i - startDayOfWeek));
  }
  
  // Add all days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
  }
  
  // Add days from next month to complete the grid (6 weeks = 42 days)
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push(addDays(monthEnd, i));
  }

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

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setShowDayModal(true);
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === selectedDate.getMonth();
  };

  const isToday = (day: Date) => {
    return isSameDay(day, new Date());
  };

  const goToPreviousMonth = () => {
    setSelectedDate(addDays(selectedDate, -30));
  };

  const goToNextMonth = () => {
    setSelectedDate(addDays(selectedDate, 30));
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
            Calendar
            {binCleaningAppointments && binCleaningAppointments.filter(a => {
              const today = new Date().toISOString().split('T')[0];
              return a.date === today && a.status === 'scheduled';
            }).length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                {binCleaningAppointments.filter(a => {
                  const today = new Date().toISOString().split('T')[0];
                  return a.date === today && a.status === 'scheduled';
                }).length}
              </Badge>
            )}
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Calendar size={24} />
                  {format(selectedDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousMonth}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextMonth}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="w-full">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 border">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => {
                    const appointments = getAppointmentsForDay(day);
                    const dayIsToday = isToday(day);
                    const dayIsCurrentMonth = isCurrentMonth(day);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleDayClick(day)}
                        className={`
                          min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors hover:bg-blue-50
                          ${dayIsToday ? 'bg-blue-100 border-blue-400' : 'bg-white'}
                          ${!dayIsCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                        `}
                      >
                        <div className={`
                          text-sm font-medium mb-1 flex items-center justify-between
                          ${dayIsToday ? 'text-blue-700' : dayIsCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        `}>
                          <span>{format(day, 'd')}</span>
                          {appointments.length > 0 && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              {appointments.length}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Show first 2 appointments with dots for more */}
                        <div className="space-y-1">
                          {appointments.slice(0, 2).map((appointment, i) => (
                            <div
                              key={i}
                              className={`
                                text-xs p-1 rounded truncate
                                ${appointment.serviceType === 'bin_cleaning' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
                              `}
                            >
                              {appointment.customerName}
                            </div>
                          ))}
                          {appointments.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{appointments.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day Detail Modal */}
          <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Calendar size={20} />
                  {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </DialogTitle>
              </DialogHeader>
              
              {selectedDay && (
                <div className="space-y-4">
                  {(() => {
                    const dayAppointments = getAppointmentsForDay(selectedDay);
                    return dayAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services scheduled</h3>
                        <p className="text-gray-500">
                          This day is available for new appointments.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Scheduled Services ({dayAppointments.length})
                        </h3>
                        {dayAppointments.map((appointment) => (
                          <div key={appointment.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                  appointment.serviceType === 'bin_cleaning' ? 'bg-blue-100' : 'bg-purple-100'
                                }`}>
                                  {appointment.serviceType === 'bin_cleaning' ? (
                                    <SprayCan className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Droplets className="h-4 w-4 text-purple-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{appointment.customerName}</p>
                                  <p className="text-sm text-gray-600">
                                    {appointment.serviceType === 'bin_cleaning' ? 'Bin Cleaning' : 'Pressure Washing'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {appointment.startTime} - {appointment.endTime}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">${appointment.price}</p>
                                <Badge
                                  variant={
                                    appointment.status === 'completed' ? 'default' :
                                    appointment.status === 'in_progress' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {appointment.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </DialogContent>
          </Dialog>
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
