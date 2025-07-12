import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Zap, Crown, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MemberDashboard from "./member-dashboard";

interface SignupData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  icon: any;
  color: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 59.99,
    icon: Shield,
    color: "bg-blue-50 border-blue-200 text-blue-800",
    features: [
      "Weekly trash bin valet service",
      "Up to 3 cans included",
      "Reliable weekly pickup",
      "Email notifications"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 99.99,
    icon: Zap,
    color: "bg-green-50 border-green-200 text-green-800",
    features: [
      "Weekly trash bin valet service",
      "2 free bin cleanings per month",
      "15% off all pressure washing services",
      "Priority customer support"
    ],
    popular: true
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 199.99,
    icon: Crown,
    color: "bg-purple-50 border-purple-200 text-purple-800",
    features: [
      "Weekly trash bin valet service",
      "4 free bin cleanings per month",
      "50% off all pressure washing services",
      "Premium support & priority scheduling"
    ]
  }
];

export default function CustomerPortal() {
  const [step, setStep] = useState<'signup' | 'plans' | 'benefits' | 'payment' | 'confirmation' | 'member' | 'login'>('signup');
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    billingAddress: ""
  });
  const [createdCustomer, setCreatedCustomer] = useState<any>(null);
  const [loginData, setLoginData] = useState({
    phone: "",
    email: ""
  });
  const { toast } = useToast();

  // Dummy customer data for demo purposes
  const dummyCustomer = {
    id: 1,
    name: "John Doe",
    phone: "(555) 123-4567",
    email: "john@example.com",
    address: "123 Main Street, Anytown, ST 12345",
    route: "Route A",
    status: "active",
    plan: "premium",
    monthlyRate: "99.99",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const renderNavigation = () => (
    <div className="bg-gray-100 border-b mb-6">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <Button
            variant={step === 'signup' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStep('signup')}
          >
            Sign Up
          </Button>
          <Button
            variant={step === 'plans' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStep('plans')}
          >
            Plans
          </Button>
          <Button
            variant={step === 'benefits' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStep('benefits')}
          >
            Benefits
          </Button>
          <Button
            variant={step === 'payment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStep('payment')}
          >
            Payment
          </Button>
          <Button
            variant={step === 'confirmation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStep('confirmation')}
          >
            Confirmation
          </Button>
          <Button
            variant={step === 'member' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCreatedCustomer(dummyCustomer);
              setStep('member');
            }}
          >
            Member Dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("POST", "/api/customers", customerData);
      return response;
    },
    onSuccess: (data) => {
      setCreatedCustomer(data);
      setStep('confirmation');
      toast({
        title: "Welcome to regal care!",
        description: "Your account has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (loginInfo: { phone: string; email: string }) => {
      const response = await apiRequest("GET", "/api/customers");
      const customers = response;
      
      // Find customer by phone number (primary) or email (secondary)
      const customer = customers.find((c: any) => 
        c.phone.replace(/\D/g, '') === loginInfo.phone.replace(/\D/g, '') || 
        (loginInfo.email && c.email === loginInfo.email)
      );
      
      if (!customer) {
        throw new Error("Customer not found");
      }
      
      return customer;
    },
    onSuccess: (customer) => {
      setCreatedCustomer(customer);
      setStep('member');
      toast({
        title: "Welcome back!",
        description: `Logged in successfully as ${customer.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Customer not found. Please check your phone number or email.",
        variant: "destructive",
      });
    },
  });

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.phone || !signupData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setStep('plans');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.phone && !loginData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your phone number or email address",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep('benefits');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    createCustomerMutation.mutate({
      ...signupData,
      route: "Route A", // Default route assignment
      status: "active",
      plan: selectedPlan,
      monthlyRate: selectedPlanData?.price.toString() || "59.99"
    });
  };

  if (step === 'signup' || step === 'login') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {step === 'login' ? 'Welcome back to regal care' : 'Welcome to regal care'}
              </CardTitle>
              <p className="text-gray-600">
                {step === 'login' ? 'Access your member dashboard' : 'Sign up for professional waste management service'}
              </p>
              
              {/* Toggle between Login and Sign Up */}
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  variant={step === 'signup' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStep('signup')}
                  type="button"
                >
                  New Member
                </Button>
                <Button
                  variant={step === 'login' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStep('login')}
                  type="button"
                >
                  Existing Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {step === 'signup' ? (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        placeholder="your@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Service Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={signupData.address}
                        onChange={(e) => setSignupData({...signupData, address: e.target.value})}
                        placeholder="123 Main Street, City, State"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Continue to Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="loginPhone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="loginPhone"
                        type="tel"
                        value={loginData.phone}
                        onChange={(e) => setLoginData({...loginData, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    OR
                  </div>

                  <div>
                    <Label htmlFor="loginEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="loginEmail"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        placeholder="your@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p>Enter either your phone number or email address to access your member dashboard.</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Logging in..." : "Access Dashboard"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (step === 'plans') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
            <p className="text-gray-600">Select the service level that works best for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.id} 
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    plan.popular ? 'ring-2 ring-primary border-primary' : 'border-gray-200'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex p-3 rounded-full ${plan.color} mb-4`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">
                      ${plan.price}
                      <span className="text-base font-normal text-gray-600">/month</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full mt-6 ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      disabled={createCustomerMutation.isPending}
                    >
                      {createCustomerMutation.isPending ? 'Setting up...' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="ghost" 
              onClick={() => setStep('signup')}
              className="text-gray-600"
            >
              ← Back to Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'benefits') {
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your regal care Benefits</h1>
            <p className="text-gray-600">Review what's included with your {selectedPlanData?.name} plan</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${selectedPlanData?.color}`}>
                    {selectedPlanData?.icon && <selectedPlanData.icon className="h-5 w-5" />}
                  </div>
                  {selectedPlanData?.name} Plan - ${selectedPlanData?.price}/month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {selectedPlanData?.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Terms and Commitment */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Service Agreement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Service Details</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Service begins within 7 days of signup</li>
                    <li>• Weekly pickup every {signupData.name ? 'Monday' : 'scheduled day'}</li>
                    <li>• Bins moved to curb by 7 AM, returned by 6 PM</li>
                    <li>• Holiday schedules may vary with advance notice</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Terms</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Month-to-month service commitment</li>
                    <li>• 30-day notice required for cancellation</li>
                    <li>• Rates subject to change with 30-day notice</li>
                    <li>• Additional fees may apply for special requests</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Satisfaction Guarantee</h3>
                  <p className="text-sm text-green-700">
                    We guarantee reliable service. If you're not completely satisfied, 
                    contact us within 24 hours for immediate resolution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button 
              variant="outline" 
              onClick={() => setStep('plans')}
              className="px-8"
            >
              ← Back to Plans
            </Button>
            <Button 
              onClick={() => setStep('payment')}
              className="px-8"
            >
              Continue to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <div className="max-w-2xl mx-auto p-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Information</h1>
            <p className="text-gray-600">Complete your regal care subscription</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold">{selectedPlanData?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Rate:</span>
                  <span className="font-semibold">${selectedPlanData?.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Setup Fee:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Today:</span>
                    <span>${selectedPlanData?.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Then ${selectedPlanData?.price}/month
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input
                      id="nameOnCard"
                      value={paymentData.nameOnCard}
                      onChange={(e) => setPaymentData({...paymentData, nameOnCard: e.target.value})}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Input
                      id="billingAddress"
                      value={paymentData.billingAddress}
                      onChange={(e) => setPaymentData({...paymentData, billingAddress: e.target.value})}
                      placeholder="123 Main Street, City, State ZIP"
                      required
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setStep('benefits')}
                      className="flex-1"
                    >
                      ← Back
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1"
                      disabled={createCustomerMutation.isPending}
                    >
                      {createCustomerMutation.isPending ? 'Processing...' : 'Complete Purchase'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Welcome to regal care!</CardTitle>
            <p className="text-gray-600">Your subscription is now active</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Account Details</h3>
              <p className="text-sm text-gray-600">Name: {signupData.name}</p>
              <p className="text-sm text-gray-600">Phone: {signupData.phone}</p>
              <p className="text-sm text-gray-600">Address: {signupData.address}</p>
              {selectedPlanData && (
                <p className="text-sm text-gray-600">Plan: {selectedPlanData.name} (${selectedPlanData.price}/month)</p>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
              <p className="text-sm text-blue-700">
                We'll contact you within 24 hours to schedule your first pickup and provide your service details.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setStep('member')}
              >
                Go to Member Dashboard
              </Button>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => {
                  setStep('signup');
                  setSignupData({ name: "", phone: "", email: "", address: "" });
                  setSelectedPlan("");
                  setPaymentData({ cardNumber: "", expiryDate: "", cvv: "", nameOnCard: "", billingAddress: "" });
                  setCreatedCustomer(null);
                }}
              >
                Sign Up Another Customer
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (step === 'member' && createdCustomer) {
    return (
      <MemberDashboard 
        customerId={createdCustomer.id} 
        customerData={createdCustomer}
      />
    );
  }

  return null;
}