import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight, Map, Calendar, MapPin, Clock, Truck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import RouteForm from "@/components/route-form";
import RouteMap from "@/components/route-map";
import type { Route, Customer } from "/server/schema";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";

export default function Routes() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Route> }) => {
      await apiRequest("PUT", `/api/routes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({
        title: "Success",
        description: "Route updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update route",
        variant: "destructive",
      });
    },
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getRoutesForDay = (day: Date) => {
    const dayName = format(day, 'EEEE').toLowerCase();
    return routes?.filter(route => route.day === dayName) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getRouteColor = (routeName: string) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];
    const index = routeName.charCodeAt(routeName.length - 1) % colors.length;
    return colors[index];
  };

  const handleRouteAction = (route: Route, action: string) => {
    let newStatus = route.status;
    if (action === 'start') {
      newStatus = 'in_progress';
    } else if (action === 'complete') {
      newStatus = 'completed';
    }

    updateRouteMutation.mutate({
      id: route.id,
      data: { status: newStatus }
    });
  };

  const calculateProgress = (route: Route) => {
    if (route.totalCustomers === 0) return 0;
    return (route.completedCustomers / route.totalCustomers) * 100;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleRouteOptimized = (routeId: number, optimizedCustomers: Customer[]) => {
    toast({
      title: "Route Optimized",
      description: `Route has been optimized with ${optimizedCustomers.length} customers`,
    });
    // In a real application, you'd save the optimized order to the database
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading routes...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Weekly Routes</h2>
          <p className="text-gray-600">Manage and track your service routes</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedRoute(null)}>
              <Plus className="mr-2" size={16} />
              Create Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRoute ? "Edit Route" : "Create Route"}
              </DialogTitle>
            </DialogHeader>
            <RouteForm
              route={selectedRoute}
              onSuccess={() => {
                setIsFormOpen(false);
                setSelectedRoute(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule" className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <Map size={16} />
            <span>Map View</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-6 mt-6">

      {/* Week Navigation */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Week of {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'd, yyyy')}
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const dayRoutes = getRoutesForDay(day);
              const isWeekend = index >= 5;
              const todayClass = isToday(day) ? 'bg-primary/5 border border-primary' : 'bg-gray-50';
              
              return (
                <div key={day.toISOString()} className={`rounded-lg p-4 ${isWeekend ? 'bg-gray-100' : todayClass}`}>
                  <div className="text-center mb-3">
                    <p className={`text-sm font-medium ${isToday(day) ? 'text-primary' : 'text-gray-700'}`}>
                      {format(day, 'EEE')}
                    </p>
                    <p className={`text-lg font-bold ${isToday(day) ? 'text-primary' : 'text-gray-900'}`}>
                      {format(day, 'd')}
                    </p>
                    {isToday(day) && (
                      <p className="text-xs text-primary">Today</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {dayRoutes.map((route) => (
                      <div
                        key={route.id}
                        className={`px-2 py-1 rounded text-xs cursor-pointer ${getRouteColor(route.name)}`}
                        onClick={() => {
                          setSelectedRoute(route);
                          setIsFormOpen(true);
                        }}
                      >
                        {route.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Route Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {routes?.slice(0, 3).map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{route.name}</CardTitle>
                <Badge variant={getStatusColor(route.status)}>
                  {route.status === 'completed' ? 'Completed' : 
                   route.status === 'in_progress' ? 'In Progress' : 
                   'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {route.totalCustomers} customers • Started {route.startTime}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {route.completedCustomers}/{route.totalCustomers} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      route.status === 'completed' ? 'bg-secondary' : 
                      route.status === 'in_progress' ? 'bg-accent' : 
                      'bg-gray-400'
                    }`}
                    style={{ width: `${calculateProgress(route)}%` }}
                  />
                </div>
                <div className="pt-3">
                  {route.status === 'pending' && (
                    <Button
                      className="w-full"
                      onClick={() => handleRouteAction(route, 'start')}
                    >
                      Start Route
                    </Button>
                  )}
                  {route.status === 'in_progress' && (
                    <Button
                      className="w-full"
                      onClick={() => handleRouteAction(route, 'complete')}
                    >
                      Complete Route
                    </Button>
                  )}
                  {route.status === 'completed' && (
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
  </TabsContent>
  
  <TabsContent value="map" className="space-y-6 mt-6">
    <RouteMap
      customers={customers || []}
      routes={routes || []}
      selectedRoute={selectedRoute}
      onRouteOptimized={handleRouteOptimized}
    />
  </TabsContent>
</Tabs>
</div>
  );
}
