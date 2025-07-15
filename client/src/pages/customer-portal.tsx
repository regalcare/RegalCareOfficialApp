import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Shield, Zap, Crown, Phone, Mail, MapPin, ArrowRight, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MemberDashboard from "./member-dashboard";
import logoImage from "@assets/IMG_2047_1752571535875.png";

interface SignupData {
  name: string;
  phone: string;
  email: string;
  address: string;
  serviceDay: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
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
    yearlyPrice: 660,
    icon: Shield,
    color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-800",
    features: [
      "Weekly trash bin valet <span style='font-size: 0.75em; color: #64748b; font-style: italic;'>(up to 2 cans)</span>",
      "Reliable customer support"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 99.99,
    yearlyPrice: 1089,
    icon: Zap,
    color: "bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 text-emerald-800",
    features: [
      "Weekly trash bin valet <span style='font-size: 0.75em; color: #64748b; font-style: italic;'>(up to 3 cans)</span>",
      "2 FREE bin cleanings quarterly",
      "15% discount on all pressure washing services",
      "Reliable customer support"
    ],
    popular: true
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 199.99,
    yearlyPrice: 1990,
    icon: Crown,
    color: "bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 text-purple-800",
    features: [
      "Weekly trash bin valet <span style='font-size: 0.75em; color: #64748b; font-style: italic;'>(4+ cans)</span>",
      "4 FREE bin cleanings quarterly",
      "<span style='background-color: #fee2e2; color: #991b1b; font-weight: 800; text-decoration: underline; text-decoration-color: #dc2626; text-decoration-thickness: 2px; font-size: 1.1em; padding: 2px 4px; border-radius: 4px;'>50%</span> discount on all pressure washing services",
      "Priority scheduling",
      "Reliable customer support"
    ]
  }
];

export default function CustomerPortal() {
  const [location] = useLocation();
  const { id: memberId } = useParams();
  const [step, setStep] = useState<'signup' | 'plans' | 'benefits' | 'payment' | 'confirmation' | 'member' | 'login'>('signup');
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    serviceDay: ""
  });
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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

  // Check if we're on the member route and set appropriate state
  useEffect(() => {
    if (location.includes('/customer/member/') && memberId) {
      setStep('member');
      setCreatedCustomer(dummyCustomer);
    }
  }, [location, memberId, dummyCustomer]);

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
    if (!signupData.name || !signupData.phone || !signupData.address || !signupData.serviceDay) {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {renderNavigation()}
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="tracking-tight text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-[#050000] -mb-2">
                {step === 'login' ? 'Welcome back to,' : 'Welcome to,'}
              </CardTitle>
              <div className="flex justify-center -mb-2">
                <img 
                  src={logoImage} 
                  alt="Regalcare Logo" 
                  className="w-64 h-64 object-cover"
                />
              </div>
              <p className="text-slate-600 text-lg mb-6">
                At your service, for your convenience!
              </p>
              
              {/* Toggle between Login and Sign Up */}
              <div className="flex gap-2 justify-center mt-6">
                <Button
                  variant={step === 'signup' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStep('signup')}
                  type="button"
                  className={step === 'signup' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}
                >
                  New Member
                </Button>
                <Button
                  variant={step === 'login' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStep('login')}
                  type="button"
                  className={step === 'login' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}
                >
                  Existing Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {step === 'signup' ? (
                <form onSubmit={handleSignupSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-slate-700 font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="mt-2 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number *</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="h-12 pl-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        placeholder="your@email.com"
                        className="h-12 pl-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-slate-700 font-medium">Service Address *</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <Input
                        id="address"
                        value={signupData.address}
                        onChange={(e) => setSignupData({...signupData, address: e.target.value})}
                        placeholder="123 Main Street, City, State"
                        className="h-12 pl-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="serviceDay" className="text-slate-700 font-medium">Trash Service Day *</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-4 top-4 h-4 w-4 text-slate-400 z-10" />
                      <Select 
                        value={signupData.serviceDay} 
                        onValueChange={(value) => setSignupData({...signupData, serviceDay: value})}
                        required
                      >
                        <SelectTrigger className="h-12 pl-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Select the day your trash is picked up" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monday">Monday</SelectItem>
                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                          <SelectItem value="Thursday">Thursday</SelectItem>
                          <SelectItem value="Friday">Friday</SelectItem>
                          <SelectItem value="Saturday">Saturday</SelectItem>
                          <SelectItem value="Sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Continue to Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="loginPhone" className="text-slate-700 font-medium">Phone Number</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <Input
                        id="loginPhone"
                        type="tel"
                        value={loginData.phone}
                        onChange={(e) => setLoginData({...loginData, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="h-12 pl-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="text-center text-sm text-slate-500 relative">
                    <span className="bg-white px-3 text-slate-400">OR</span>
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="loginEmail" className="text-slate-700 font-medium">Email Address</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <Input
                        id="loginEmail"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        placeholder="your@email.com"
                        className="h-12 pl-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-blue-700 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p>Enter either your phone number or email address to access your member dashboard.</p>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Logging in..." : "Access Your Dashboard"}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {renderNavigation()}
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img 
                src={logoImage} 
                alt="Regalcare Logo" 
                className="w-28 h-28 rounded-2xl object-cover shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Choose Your Plan</h1>
            <p className="text-slate-600 text-xl">Select the service level that works best for you</p>
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center mt-8 mb-4">
              <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-xl flex shadow-lg border border-slate-200">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-sm text-emerald-600 font-semibold bg-emerald-50 px-4 py-2 rounded-full inline-block">💰 Save each month with yearly plans</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.id} 
                  className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/80 backdrop-blur-sm border-0 ${
                    plan.popular ? 'ring-2 ring-gradient-to-r from-emerald-400 to-blue-500 shadow-xl scale-105' : 'shadow-lg'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-4 py-1 text-sm font-semibold shadow-lg whitespace-nowrap">✨ Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <div className={`inline-flex flex-col items-center gap-2 p-4 rounded-2xl ${plan.color} mb-6 shadow-lg`}>
                      <IconComponent className="h-8 w-8" />
                      <span className="text-lg font-bold">{plan.name}</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      ${billingCycle === 'monthly' ? plan.price : plan.yearlyPrice}
                      <span className="text-lg font-normal text-slate-500">
                        {billingCycle === 'monthly' ? '/month' : '/year'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full inline-block">
                        {plan.id === 'basic' && '💰 1 month free • Save $60'}
                        {plan.id === 'premium' && '💰 1 month free • Save $110'}
                        {plan.id === 'ultimate' && '💰 2 months free • Save $398'}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="px-6 pb-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <span className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: feature }}></span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full py-3 text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white' 
                          : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white'
                      }`}
                      disabled={createCustomerMutation.isPending}
                    >
                      {createCustomerMutation.isPending ? 'Setting up...' : 'Select Plan'}
                      <ArrowRight className="ml-2 h-4 w-4" />
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
            <div className="flex justify-center mb-4">
              <img 
                src={logoImage} 
                alt="Regalcare Logo" 
                className="w-20 h-20 rounded-xl object-cover shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your <span style={{color: '#87CEEB', fontWeight: 700}}>regalcare</span> Benefits</h1>
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
                      <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: feature }}></span>
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
                    <li>• All services begin August 1st 2025</li>
                    <li>• Weekly bin valet every {signupData.serviceDay ? signupData.serviceDay.charAt(0).toUpperCase() + signupData.serviceDay.slice(1) : 'scheduled day'}</li>
                    <li>• Bins will be moved to curb by 10pm the night before, and returned by 5pm on your scheduled trash day</li>
                    <li>• Service includes {selectedPlanData?.id === 'basic' ? 'up to 2' : selectedPlanData?.id === 'premium' ? 'up to 3' : '4+'} standard residential bins{selectedPlanData?.id === 'ultimate' ? '' : ' (additional bins may incur extra fees)'}</li>
                    <li>• Holiday schedules may vary with advance notice</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Terms</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• {billingCycle === 'yearly' ? 'Year-to-year' : 'Month-to-month'} service commitment</li>
                    <li>• Cancel anytime with 30-day notice</li>
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
            <div className="flex justify-center mb-4">
              <img 
                src={logoImage} 
                alt="Regalcare Logo" 
                className="w-20 h-20 rounded-xl object-cover shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Information</h1>
            <p className="text-gray-600">Complete your <span style={{color: '#87CEEB', fontWeight: 700}}>regalcare</span> subscription</p>
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
            <div className="flex justify-center mb-4">
              <img 
                src={logoImage} 
                alt="Regalcare Logo" 
                className="w-20 h-20 rounded-xl object-cover shadow-lg"
              />
            </div>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Welcome to <span style={{color: '#87CEEB', fontWeight: 700}}>regalcare</span>!</CardTitle>
            <p className="text-gray-600">Your subscription is now active</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Account Details</h3>
              <p className="text-sm text-gray-600">Name: {signupData.name}</p>
              <p className="text-sm text-gray-600">Phone: {signupData.phone}</p>
              <p className="text-sm text-gray-600">Address: {signupData.address}</p>
              <p className="text-sm text-gray-600">Service Day: {signupData.serviceDay ? signupData.serviceDay.charAt(0).toUpperCase() + signupData.serviceDay.slice(1) : 'Not specified'}</p>
              {selectedPlanData && (
                <p className="text-sm text-gray-600">Plan: {selectedPlanData.name} (${selectedPlanData.price}/month)</p>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
              <p className="text-sm text-blue-700">Don't worry about remembering trash day anymore, 
              we got it!</p>
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
                  setSignupData({ name: "", phone: "", email: "", address: "", serviceDay: "" });
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