import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Calendar, Settings, Send, Clock, CheckCircle, Phone, Mail, MapPin, X, Crown, Star, ArrowUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Customer, Message, BinCleaningAppointment } from "@shared/schema";
import { format, addDays, startOfWeek, isSameDay, isAfter } from "date-fns";
import { useLocation } from "wouter";
import logoImage from "@assets/IMG_2047_1752571535875.png";

interface MemberDashboardProps {
  customerId: number;
  customerData: Customer;
}

export default function MemberDashboard({ customerId, customerData }: MemberDashboardProps) {
  const [newMessage, setNewMessage] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [binCount, setBinCount] = useState("1");
  const [pressureWashArea, setPressureWashArea] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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

  const scheduleServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      await apiRequest("POST", "/api/bin-cleaning", serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bin-cleaning"] });
      setServiceDate("");
      setServiceType("");
      setBinCount("1");
      setPressureWashArea("");
      toast({
        title: "Service scheduled",
        description: "Your service has been scheduled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule service. Please try again.",
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

  const handleScheduleService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDate || !serviceType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (serviceType === "pressure-washing" && !pressureWashArea.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe the area that needs pressure washing",
        variant: "destructive",
      });
      return;
    }

    // Verify the selected date matches customer's service day
    const selectedDate = new Date(serviceDate);
    const dayOfWeek = selectedDate.getDay();
    const dayMap = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    const expectedDayOfWeek = dayMap[customerData.serviceDay as keyof typeof dayMap] || 2;
    
    if (dayOfWeek !== expectedDayOfWeek) {
      toast({
        title: "Invalid Date",
        description: `Please select a ${customerData.serviceDay} for service scheduling`,
        variant: "destructive",
      });
      return;
    }

    // Calculate price based on service type and customer plan
    let servicePrice = 0;
    
    if (serviceType === "bin-cleaning") {
      const binCountNum = parseInt(binCount);
      const customerPlan = customerData.plan;
      
      if (customerPlan === 'basic') {
        // Basic plan: $40 per bin
        servicePrice = binCountNum * 4000; // $40.00 in cents
      } else if (customerPlan === 'premium') {
        // Premium plan: 2 free bins, then $34 per bin
        const chargeableBins = Math.max(0, binCountNum - 2);
        servicePrice = chargeableBins * 3400; // $34.00 in cents
      } else if (customerPlan === 'ultimate') {
        // Ultimate plan: included in plan (free)
        servicePrice = 0;
      }
    } else if (serviceType === "pressure-washing") {
      // Pressure washing requires custom quote - price set to 0 for now
      servicePrice = 0;
    }

    const serviceData: any = {
      customerId: customerId,
      customerName: customerData.name,
      address: customerData.address,
      date: serviceDate,
      startTime: "09:00", // Default start time for service day
      endTime: "17:00", // Default end time for service day
      binCount: serviceType === "bin-cleaning" ? parseInt(binCount) : 1, // Default to 1 for pressure washing
      price: servicePrice,
      status: "scheduled",
    };

    // Add pressure washing area details if applicable
    if (serviceType === "pressure-washing") {
      serviceData.notes = `Pressure washing area: ${pressureWashArea}`;
    }

    scheduleServiceMutation.mutate(serviceData);
  };

  const customerMessages = messages?.filter(msg => msg.customerId === customerId) || [];
  const customerAppointments = appointments?.filter(apt => apt.customerId === customerId) || [];

  // Generate calendar data for customer's service day
  const generateServiceDayCalendar = () => {
    const calendar = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1); // Start 2 months ago
    
    // Convert service day to day number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayMap = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    const serviceDayNumber = dayMap[customerData.serviceDay as keyof typeof dayMap] || 2; // Default to Tuesday
    
    for (let i = 0; i < 16; i++) { // Show 16 weeks of service days
      const serviceDay = addDays(startDate, i * 7);
      // Find the service day of this week
      const weekStart = startOfWeek(serviceDay, { weekStartsOn: 1 }); // Monday = 1
      const serviceDayOfWeek = addDays(weekStart, serviceDayNumber - 1); // Adjust for service day
      
      // Check if this service day has a completed pickup
      const hasPickup = Math.random() > 0.3; // Simulate pickup completion
      const isCompleted = isAfter(today, serviceDayOfWeek) ? hasPickup : false;
      const isFuture = isAfter(serviceDayOfWeek, today);
      
      calendar.push({
        date: serviceDayOfWeek,
        isCompleted,
        isFuture,
        isToday: isSameDay(serviceDayOfWeek, today),
      });
    }
    
    return calendar;
  };

  const serviceDayCalendar = generateServiceDayCalendar();

  const handleUpgrade = (planType: string) => {
    // Navigate to payment page for the selected plan
    setLocation(`/customer/upgrade/${customerId}`);
    setShowPlanModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={logoImage} 
                alt="Regalcare Logo" 
                className="w-16 h-16 object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {customerData.name}</h1>
                <p className="text-gray-600"><span style={{color: '#87CEEB', fontWeight: 700, fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.01em'}}>regalcare</span> member dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
                <DialogTrigger asChild>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200 transition-colors flex items-center gap-1">
                    {customerData.plan === 'premium' && <Crown className="h-3 w-3" />}
                    {customerData.plan === 'ultimate' && <Star className="h-3 w-3" />}
                    {customerData.plan?.charAt(0).toUpperCase() + customerData.plan?.slice(1)} Plan
                  </Badge>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {customerData.plan === 'premium' && <Crown className="h-5 w-5 text-yellow-500" />}
                      {customerData.plan === 'ultimate' && <Star className="h-5 w-5 text-purple-500" />}
                      Your {customerData.plan?.charAt(0).toUpperCase() + customerData.plan?.slice(1)} Plan Benefits
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Current Plan Benefits */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-3">What's Included in Your Plan</h3>
                      
                      {customerData.plan === 'basic' && (
                        <div className="space-y-2 text-sm text-green-700">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Weekly trash bin valet
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Reliable customer support
                          </div>
                        </div>
                      )}
                      
                      {customerData.plan === 'premium' && (
                        <div className="space-y-2 text-sm text-green-700">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Weekly trash bin valet
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-semibold">2 FREE bin cleanings per month</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            1 FREE bulky item pick every 2 months
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            15% discount on all pressure washing services
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Reliable customer support
                          </div>
                        </div>
                      )}
                      
                      {customerData.plan === 'ultimate' && (
                        <div className="space-y-2 text-sm text-green-700">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Weekly trash bin valet
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-semibold">4 FREE bin cleanings per month</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            1 FREE bulky item pickup per month
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            50% discount on all pressure washing services
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-semibold">Priority scheduling</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Reliable customer support
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Upgrade Options */}
                    {customerData.plan !== 'ultimate' && (
                      <div className="border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <ArrowUp className="h-4 w-4" />
                          Upgrade Your Plan
                        </h3>
                        
                        {customerData.plan === 'basic' && (
                          <div className="space-y-4">
                            <div className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                  Premium Plan
                                </h4>
                                <span className="text-lg font-bold text-blue-600">$99.99/month</span>
                              </div>
                              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                                <li>• Weekly trash bin valet</li>
                                <li>• 2 FREE bin cleanings per month</li>
                                <li>• 1 FREE bulky item pick every 2 months</li>
                                <li>• 15% discount on all pressure washing services</li>
                                <li>• Reliable customer support</li>
                              </ul>
                              <Button onClick={() => handleUpgrade('premium')} className="w-full">Upgrade to Premium</Button>
                            </div>
                            
                            <div className="border rounded-lg p-4 hover:bg-purple-50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Star className="h-4 w-4 text-purple-500" />
                                  Ultimate Plan
                                </h4>
                                <span className="text-lg font-bold text-purple-600">$199.99/month</span>
                              </div>
                              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                                <li>• Weekly trash bin valet</li>
                                <li>• 4 FREE bin cleanings per month</li>
                                <li>• 1 FREE bulky item pickup per month</li>
                                <li>• 50% discount on all pressure washing services</li>
                                <li>• Priority scheduling</li>
                                <li>• Reliable customer support</li>
                              </ul>
                              <Button onClick={() => handleUpgrade('ultimate')} className="w-full bg-purple-600 hover:bg-purple-700">Upgrade to Ultimate</Button>
                            </div>
                          </div>
                        )}
                        
                        {customerData.plan === 'premium' && (
                          <div className="border rounded-lg p-4 hover:bg-purple-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center gap-2">
                                <Star className="h-4 w-4 text-purple-500" />
                                Ultimate Plan
                              </h4>
                              <span className="text-lg font-bold text-purple-600">$199.99/month</span>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-1 mb-3">
                              <li>• Weekly trash bin valet</li>
                              <li>• 4 FREE bin cleanings per month</li>
                              <li>• 1 FREE bulky item pickup per month</li>
                              <li>• 50% discount on all pressure washing services</li>
                              <li>• Priority scheduling</li>
                              <li>• Reliable customer support</li>
                            </ul>
                            <Button onClick={() => handleUpgrade('ultimate')} className="w-full bg-purple-600 hover:bg-purple-700">Upgrade to Ultimate</Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {customerData.plan === 'ultimate' && (
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <h3 className="font-semibold text-purple-800">You're on our highest tier!</h3>
                        <p className="text-sm text-purple-600 mt-1">
                          Enjoy all premium benefits with unlimited services.
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Badge variant="outline">{customerData.status}</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Schedule a Service
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Leave a Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Leave a Message
                  </CardTitle>
                  <p className="text-sm text-gray-600">Send a message to <span style={{color: '#87CEEB', fontWeight: 700, fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.01em'}}>regalcare</span> support team</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <Label htmlFor="message">Your Message</Label>
                      <Textarea
                        id="message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="How can we help you today? Please describe your question, concern, or feedback..."
                        className="min-h-32"
                        rows={6}
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Quick Tips:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• For urgent matters, please call us directly</li>
                        <li>• We typically respond within 24 hours</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                      className="w-full"
                    >
                      {sendMessageMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Recent Messages Summary */}
                  {!messagesLoading && customerMessages.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">Recent Messages</h4>
                      <div className="space-y-2">
                        {customerMessages.slice(-3).map((message) => (
                          <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-800">{message.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {message.isFromCustomer ? 'You' : 'regal care'} • {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Schedule a Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleScheduleService} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Select value={serviceType} onValueChange={setServiceType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bin-cleaning">Bin Cleaning</SelectItem>
                            <SelectItem value="pressure-washing">Pressure Washing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {serviceType === "bin-cleaning" && (
                        <div>
                          <Label htmlFor="binCount">Number of Bins</Label>
                          <Select value={binCount} onValueChange={setBinCount}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select number of bins" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Bin</SelectItem>
                              <SelectItem value="2">2 Bins</SelectItem>
                              <SelectItem value="3">3 Bins</SelectItem>
                              <SelectItem value="4">4 Bins</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {serviceType === "pressure-washing" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-3">Pressure Washing Details</h4>
                        <div>
                          <Label htmlFor="pressureWashArea">What area of your house needs pressure washing?</Label>
                          <Textarea
                            id="pressureWashArea"
                            value={pressureWashArea}
                            onChange={(e) => setPressureWashArea(e.target.value)}
                            placeholder="Please describe the specific area(s) that need pressure washing (e.g., driveway, deck, siding, walkway, patio, etc.)"
                            className="mt-2"
                            rows={3}
                            required
                          />
                        </div>
                        <p className="text-sm text-blue-700 mt-2">
                          Our team will contact you to provide a custom quote based on the area and scope of work.
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="serviceDate">Service Date</Label>
                      <Input
                        id="serviceDate"
                        type="date"
                        value={serviceDate}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          const dayOfWeek = selectedDate.getDay();
                          if (dayOfWeek === 2) { // Tuesday is day 2
                            setServiceDate(e.target.value);
                          } else {
                            toast({
                              title: "Invalid Date",
                              description: "Please select a Tuesday for service scheduling",
                              variant: "destructive",
                            });
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Services only available on Tuesdays
                      </p>
                    </div>

                    {/* Pricing Display */}
                    {serviceType && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">With Your {customerData.plan?.charAt(0).toUpperCase() + customerData.plan?.slice(1)} Plan:</h3>
                        {serviceType === "bin-cleaning" ? (
                          <div className="text-sm text-green-700">
                            {customerData.plan === 'basic' && (
                              <p>• Bin cleaning: $40.00 per bin</p>
                            )}
                            {customerData.plan === 'premium' && (
                              <>
                                <p>• First 2 bins: FREE</p>
                                <p>• Additional bins: $40.00 each</p>
                                <p>• 15% discount</p>
                                {serviceType === "bin-cleaning" && binCount && parseInt(binCount) > 2 && (
                                  <>
                                    <p className="font-semibold mt-2">Original pricing: ${(parseInt(binCount) * 40).toFixed(2)}</p>
                                    <p className="font-semibold text-green-600">Your price: ${((parseInt(binCount) - 2) * 40 * 0.85).toFixed(2)} (15% discount)</p>
                                  </>
                                )}
                                {serviceType === "bin-cleaning" && binCount && parseInt(binCount) <= 2 && (
                                  <>
                                    <p className="font-semibold mt-2">Original pricing: ${(parseInt(binCount) * 40).toFixed(2)}</p>
                                    <p className="font-semibold text-green-600">Your price: FREE</p>
                                  </>
                                )}
                              </>
                            )}
                            {customerData.plan === 'ultimate' && (
                              <p className="font-semibold text-green-600">• Bin cleaning: Included in your plan (FREE)</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-green-700">
                            {customerData.plan === 'premium' ? (
                              <p>• Pressure washing: $0.70/sqft, discounted by 15% with plan</p>
                            ) : customerData.plan === 'ultimate' ? (
                              <p>• Pressure washing: $0.70/sqft, discounted by 50% with plan</p>
                            ) : (
                              <p>• Pressure washing: Custom quote based on area and scope</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Service Information</h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Bin cleanings only available on your scheduled trash day</li>
                        <li>• Professional cleaning equipment used</li>
                        <li>• Eco-friendly cleaning products</li>
                        <li>• Service scheduled during regular business hours</li>
                      </ul>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={scheduleServiceMutation.isPending}
                    >
                      {scheduleServiceMutation.isPending ? 'Scheduling...' : 'Schedule Service'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Current Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Scheduled Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse">Loading appointments...</div>
                    </div>
                  ) : customerAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No services scheduled yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {customerData.serviceDay} Pickup Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Your Weekly Schedule</h3>
                      <div className="flex items-center gap-2 text-blue-700">
                        <Clock className="h-4 w-4" />
                        <span>Every {customerData.serviceDay} - Trash Bin Valet Service</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-2">Bins will be moved to curb by 10pm the night before, and returned by 5pm on your scheduled trash day</p>
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span>Not Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                          <span>Scheduled</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {serviceDayCalendar.map((day, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border text-center ${
                              day.isToday 
                                ? 'bg-blue-100 border-blue-300' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {format(day.date, 'MMM d')}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {format(day.date, 'yyyy')}
                            </div>
                            <div className="flex justify-center">
                              {day.isFuture ? (
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                              ) : day.isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            {day.isToday && (
                              <div className="text-xs text-blue-600 mt-1 font-medium">
                                Today
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Service Notes</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Service may be delayed due to weather conditions</li>
                        <li>• Holiday schedules announced in advance</li>
                        <li>• Contact us if your bins are not serviced by 7 PM</li>
                        <li>• Bins should be accessible and not blocked by vehicles</li>
                        <li>• Not blocked by vehicles or locked gates</li>
                      </ul>
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