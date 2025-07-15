import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, CheckCircle, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CleaningForm from "@/components/cleaning-form";
import type { BinCleaningAppointment } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from "date-fns";

export default function BinCleaning() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<BinCleaningAppointment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: appointments, isLoading } = useQuery<BinCleaningAppointment[]>({
    queryKey: ["/api/bin-cleaning"],
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BinCleaningAppointment> }) => {
      await apiRequest("PUT", `/api/bin-cleaning/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bin-cleaning"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments?.filter(a => a.date === today) || [];
  const completedToday = todayAppointments.filter(a => a.status === 'completed');
  const pendingToday = todayAppointments.filter(a => a.status === 'scheduled');
  const todayRevenue = completedToday.reduce((sum, a) => sum + a.price, 0);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    return appointments?.filter(appointment => appointment.date === dayString) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleStatusChange = (appointment: BinCleaningAppointment, newStatus: string) => {
    updateAppointmentMutation.mutate({
      id: appointment.id,
      data: { status: newStatus }
    });
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading appointments...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bin Cleaning</h2>
          <p className="text-gray-600">Schedule and manage bin cleaning appointments</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedAppointment(null)}>
              <Plus className="mr-2" size={16} />
              Schedule Cleaning
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAppointment ? "Edit Appointment" : "Schedule Cleaning"}
              </DialogTitle>
            </DialogHeader>
            <CleaningForm
              appointment={selectedAppointment}
              onSuccess={() => {
                setIsFormOpen(false);
                setSelectedAppointment(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Cleanings</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingToday.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(todayRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-6 text-xs mb-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-green-700">Available Days</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span className="text-blue-700">Has Appointments</span>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mb-4">
              Bin cleaning is available on <strong>Mondays and Thursdays</strong> between <strong>8:00 AM - 4:00 PM</strong>
            </p>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isToday = isSameDay(day, new Date());
              const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, 4 = Thursday
              const isAvailableDay = dayOfWeek === 1 || dayOfWeek === 4; // Monday or Thursday
              
              return (
                <div
                  key={day.toISOString()}
                  className={`h-20 p-1 text-center border rounded ${
                    isToday ? 'bg-primary/10 border-primary' : 
                    isAvailableDay ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday ? 'text-primary' : 
                    isAvailableDay ? 'text-green-800' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {isAvailableDay && (
                    <div className="text-xs text-green-600 mt-1">
                      Available
                    </div>
                  )}
                  {dayAppointments.length > 0 && (
                    <div className="bg-blue-100 text-blue-800 text-xs rounded px-1 mt-1">
                      {dayAppointments.length} appt{dayAppointments.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            {todayAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No appointments scheduled for today</p>
            ) : (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      appointment.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {appointment.status === 'completed' ? (
                        <CheckCircle className="text-green-600" size={16} />
                      ) : (
                        <Clock className="text-yellow-600" size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.customerName}</p>
                      <p className="text-sm text-gray-600">
                        8:00 AM - 4:00 PM • {appointment.binCount} bin{appointment.binCount > 1 ? 's' : ''} • Bin Cleaning
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    {appointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(appointment, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
