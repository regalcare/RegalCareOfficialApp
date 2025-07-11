import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, SprayCan, Truck, Phone } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CleaningForm from "@/components/cleaning-form";
import type { Customer, Message, BinCleaningAppointment } from "@shared/schema";
import { format } from "date-fns";

export default function CustomerPortal() {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showCleaningForm, setShowCleaningForm] = useState(false);
  const { toast } = useToast();

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: appointments } = useQuery<BinCleaningAppointment[]>({
    queryKey: ["/api/bin-cleaning"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { customerId: number | null; customerName: string; message: string; isFromCustomer: boolean }) => {
      await apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessageText("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleLookup = () => {
    const customer = customers?.find(c => c.phone === customerPhone);
    if (customer) {
      setCustomerData(customer);
      toast({
        title: "Account Found",
        description: `Welcome back, ${customer.name}!`,
      });
    } else {
      toast({
        title: "Account Not Found",
        description: "Please check your phone number or contact us to sign up",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (!customerData || !messageText.trim()) return;

    sendMessageMutation.mutate({
      customerId: customerData.id,
      customerName: customerData.name,
      message: messageText,
      isFromCustomer: true
    });
  };

  const customerMessages = messages?.filter(msg => msg.customerId === customerData?.id)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) || [];

  const customerAppointments = appointments?.filter(app => app.customerId === customerData?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      default: return 'outline';
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">TrashPro Customer Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="tel:555-0123" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Phone size={16} />
                <span className="text-sm">Call Us: (555) 012-3456</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!customerData ? (
          /* Login Section */
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Access Your Account</CardTitle>
                <p className="text-gray-600">Enter your phone number to view your service details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                  />
                </div>
                <Button onClick={handleLookup} className="w-full">
                  Access My Account
                </Button>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    New customer? <a href="tel:555-0123" className="text-primary hover:underline">Call us to sign up</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Customer Dashboard */
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Welcome, {customerData.name}</CardTitle>
                    <p className="text-gray-600">{customerData.address}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(customerData.status)} className="mb-2">
                      {customerData.status}
                    </Badge>
                    <p className="text-sm text-gray-600">Route: {customerData.route}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck size={20} />
                    <span>Your Service</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Trash Can Moving Service</h4>
                      <p className="text-sm text-gray-600">
                        We move your trash cans from the side of your house to the street for pickup
                      </p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm"><strong>Route:</strong> {customerData.route}</p>
                      <p className="text-sm"><strong>Status:</strong> {customerData.status}</p>
                      <p className="text-sm"><strong>Address:</strong> {customerData.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bin Cleaning Service */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SprayCan size={20} />
                    <span>Bin Cleaning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Schedule professional bin cleaning service to keep your trash cans fresh and sanitary
                    </p>
                    <Button 
                      onClick={() => setShowCleaningForm(true)}
                      className="w-full"
                    >
                      Schedule Bin Cleaning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            {customerAppointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar size={20} />
                    <span>Your Appointments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Bin Cleaning</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(appointment.date), 'PPP')} • {appointment.startTime} - {appointment.endTime}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.binCount} bin{appointment.binCount > 1 ? 's' : ''} • {formatPrice(appointment.price)}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare size={20} />
                  <span>Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Send Message */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Send us a message</h4>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your message here..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        size="sm"
                      >
                        {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </div>

                  {/* Message History */}
                  {customerMessages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recent Messages</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customerMessages.slice(0, 5).map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.isFromCustomer ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {message.createdAt ? format(new Date(message.createdAt), 'PPp') : 'Unknown time'} 
                              {message.isFromCustomer ? ' (You)' : ' (TrashPro)'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <div className="text-center">
              <Button variant="outline" onClick={() => {
                setCustomerData(null);
                setCustomerPhone("");
              }}>
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Cleaning Form Modal */}
      {showCleaningForm && customerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Schedule Bin Cleaning</h3>
            <CleaningForm
              appointment={{
                id: 0,
                customerId: customerData.id,
                customerName: customerData.name,
                address: customerData.address,
                date: new Date().toISOString().split('T')[0],
                startTime: "09:00",
                endTime: "10:00",
                binCount: 1,
                price: 2500,
                status: "scheduled",
                createdAt: new Date()
              }}
              onSuccess={() => {
                setShowCleaningForm(false);
                queryClient.invalidateQueries({ queryKey: ["/api/bin-cleaning"] });
              }}
            />
            <Button 
              variant="outline" 
              onClick={() => setShowCleaningForm(false)}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}