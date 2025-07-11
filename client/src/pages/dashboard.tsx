import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, CheckCircle, Mail, SprayCan, AlertCircle, Clock } from "lucide-react";
import type { Customer, Route as RouteType, Message, BinCleaningAppointment } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: routes } = useQuery<RouteType[]>({
    queryKey: ["/api/routes"],
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: binCleaningAppointments } = useQuery<BinCleaningAppointment[]>({
    queryKey: ["/api/bin-cleaning"],
  });

  const today = new Date().toISOString().split('T')[0];
  const todayRoutes = routes?.filter(r => r.day === format(new Date(), 'EEEE').toLowerCase()) || [];
  const completedRoutes = todayRoutes.filter(r => r.status === 'completed');
  const unreadMessages = messages?.filter(msg => !msg.isRead) || [];
  const todayCleanings = binCleaningAppointments?.filter(a => a.date === today) || [];

  const todayRevenue = todayCleanings
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Today's overview and quick actions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Route className="text-primary" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Routes</p>
                <p className="text-2xl font-bold text-gray-900">{todayRoutes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-secondary" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedRoutes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Mail className="text-accent" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">New Messages</p>
                <p className="text-2xl font-bold text-gray-900">{unreadMessages.length}</p>
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
                <p className="text-sm text-gray-600">Bin Cleanings</p>
                <p className="text-2xl font-bold text-gray-900">{todayCleanings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Routes and Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayRoutes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No routes scheduled for today</p>
              ) : (
                todayRoutes.map((route) => (
                  <div key={route.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{route.name}</p>
                      <p className="text-sm text-gray-600">
                        {route.totalCustomers} customers • {route.startTime}
                      </p>
                    </div>
                    <Badge
                      variant={
                        route.status === 'completed' ? 'default' : 
                        route.status === 'in_progress' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {route.status === 'completed' ? 'Completed' : 
                       route.status === 'in_progress' ? 'In Progress' : 
                       'Pending'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unreadMessages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No new messages</p>
              ) : (
                unreadMessages.slice(0, 3).map((message) => (
                  <div key={message.id} className="p-4 bg-blue-50 border-l-4 border-primary rounded-r-lg">
                    <p className="font-medium text-gray-900">{message.customerName}</p>
                    <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {message.createdAt ? format(new Date(message.createdAt), 'PPp') : 'Unknown time'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
