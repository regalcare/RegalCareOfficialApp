import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, DollarSign, SprayCan, Droplets } from "lucide-react";
import type { Customer, BinCleaningAppointment } from "@shared/schema";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: binCleaningAppointments } = useQuery<BinCleaningAppointment[]>({
    queryKey: ["/api/bin-cleaning"],
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Dashboard</h2>
        <p className="text-gray-600">Manage your services, customers, and revenue</p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar size={16} />
            Services Calendar
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users size={16} />
            Customer List
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
