import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Calendar, User, Send, Clock, CheckCircle, Phone, Mail, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Customer, Message, BinCleaningAppointment } from "@shared/schema";
import { format } from "date-fns";

interface MemberDashboardProps {
  customerId: number;
  customerData: Customer;
}

export default function MemberDashboard({ customerId, customerData }: MemberDashboardProps) {
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<BinCleaningAppointment[]>({
    queryKey: ["/api/bin-cleaning"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { customerId: number; customerName: string; message: string; isFromCustomer: boolean }) => {
      await apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      customerId: customerId,
      customerName: customerData.name,
      message: newMessage,
      isFromCustomer: true,
    });
  };

  const customerMessages = messages?.filter(msg => msg.customerId === customerId) || [];
  const customerAppointments = appointments?.filter(apt => apt.customerId === customerId) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {customerData.name}</h1>
              <p className="text-gray-600">regal care member dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {customerData.plan?.charAt(0).toUpperCase() + customerData.plan?.slice(1)} Plan
              </Badge>
              <Badge variant="outline">{customerData.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse">Loading messages...</div>
                      </div>
                    ) : customerMessages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No messages yet. Start a conversation below!
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {customerMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isFromCustomer ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-sm p-3 rounded-lg ${
                                message.isFromCustomer
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${message.isFromCustomer ? 'text-blue-200' : 'text-gray-500'}`}>
                                {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="mt-6">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        rows={3}
                      />
                      <Button
                        type="submit"
                        disabled={sendMessageMutation.isPending || !newMessage.trim()}
                        className="h-fit"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Your Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Weekly Pickup Schedule</h3>
                      <div className="flex items-center gap-2 text-blue-700">
                        <Clock className="h-4 w-4" />
                        <span>Every Monday - Route: {customerData.route}</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-2">
                        Bins moved to curb by 7:00 AM, returned by 6:00 PM
                      </p>
                    </div>

                    {appointmentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse">Loading appointments...</div>
                      </div>
                    ) : customerAppointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No bin cleaning appointments scheduled yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h3 className="font-semibold">Bin Cleaning Appointments</h3>
                        {customerAppointments.map((appointment) => (
                          <div key={appointment.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                  appointment.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                                }`}>
                                  {appointment.status === 'completed' ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{appointment.date}</p>
                                  <p className="text-sm text-gray-600">
                                    {appointment.startTime} - {appointment.endTime}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                                  {appointment.status}
                                </Badge>
                                <p className="text-sm text-gray-600 mt-1">
                                  {appointment.binCount} bin{appointment.binCount > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Name</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{customerData.name}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{customerData.phone}</span>
                        </div>
                      </div>
                      
                      {customerData.email && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Email</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{customerData.email}</span>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Service Address</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{customerData.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Current Plan</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Plan:</span>
                            <Badge variant="secondary">
                              {customerData.plan?.charAt(0).toUpperCase() + customerData.plan?.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Monthly Rate:</span>
                            <span className="font-semibold">${customerData.monthlyRate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Status:</span>
                            <Badge variant={customerData.status === 'active' ? 'default' : 'secondary'}>
                              {customerData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
                        <p className="text-sm text-blue-700 mb-3">
                          Contact our customer service team for any questions or concerns.
                        </p>
                        <Button variant="outline" size="sm">
                          Contact Support
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}