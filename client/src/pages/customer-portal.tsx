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
import { useAuth } from "@/lib/auth";
import logoImage from "@assets/IMG_2051.jpeg";


interface SignupData {
  name: string;
  phone: string;
  email: string;
  address: string;
  password: string;
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
    id: "free",
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    icon: Shield,
    color: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-800",
    features: [
      "Account access",
      "Customer support", 
      "Pay-per-service scheduling",
      "No monthly commitment"
    ]
  },
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
  const [location, setLocation] = useLocation();
  const { id: memberId } = useParams();
  const [step, setStep] = useState<'signup' | 'plans' | 'benefits' | 'payment' | 'confirmation' | 'member' | 'login'>('signup');
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
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
  const { user, login } = useAuth();
  const [loginData, setLoginData] = useState({
    phone: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const [createdCustomer, setCreatedCustomer] = useState<any>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (user?.role === "customer") {
      setStep("member");
    }
  }, [user]);

  // Check if we're on the member route
  useEffect(() => {
    if (location.includes('/customer/member/') && memberId) {
      // If user is already logged in, show member dashboard
      if (user?.role === "customer") {
        setStep('member');
      }
    }
  }, [location, memberId, user]);

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
              if (user?.role === "customer") {
                setStep('member');
              } else {
                toast({
                  title: "Please log in",
                  description: "You need to log in to access the member dashboard",
                  variant: "destructive",
                });
                setStep('login');
              }
            }}
          >
            Member Dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.phone || !signupData.address || !signupData.serviceDay || !signupData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setStep('plans');
  };

  const handleSkipPlan = async () => {
    try {
      // Create account without a plan
      const signupResponse = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
          address: signupData.address,
          plan: 'free', // Default to free plan when skipping
          role: 'customer',
        }),
      });

      const data = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(data.error || data.message || 'Signup failed');
      }

      // Store user in auth context
      const userData = data.user;
      login(userData);

      toast({
        title: "Account created!",
        description: "You have a free account. You can upgrade to a paid plan anytime.",
        variant: "default",
      });

      setStep('member');
    } catch (error: any) {
      console.error('Account creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      // Store user in auth context
      const userData = data.user;
      login(userData);

      toast({
        title: "Welcome back!",
        description: "Login successful",
      });

      // Navigate based on role
      if (userData.role === "admin") {
        setLocation("/"); // Admin dashboard
      } else {
        setStep("member");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login Error",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep('benefits');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First create the account with password
      const signupResponse = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
          address: signupData.address,
          plan: selectedPlan,
          role: 'customer',
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || signupData.message || 'Signup failed');
      }

      // Store user in auth context
      const userData = signupData.user;
      login(userData);
      setCreatedCustomer(userData);

      toast({
        title: "Welcome to regal care!",
        description: "Your account has been created successfully",
      });

      setStep('confirmation');
    } catch (error: any) {
      console.error('Account creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (step === 'signup' || step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {renderNavigation()}
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex flex-col items-center mb-6">
                <CardTitle className="tracking-tight text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-[#050000] text-center whitespace-nowrap">
                  {step === 'login' ? 'Welcome back to,' : 'Welcome to,'}
                </CardTitle>

                <img 
                  src={logoImage} 
                  alt="Regalcare Logo" 
                  className="w-48 h-48 object-contain mb-4"
                />

                <p className="text-slate-600 text-lg text-center italic whitespace-nowrap mb-6">
                  At your service, for your convenience!
                </p>

                <div className="flex gap-2 justify-center">
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
              </div>
            </CardHeader>

            <CardContent className="pt-0 -mt-4">
              {step === 'signup' ? (
                <form onSubmit={handleSignupSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Service Address *</Label>
                    <Input
                      id="address"
                      value={signupData.address}
                      onChange={(e) => setSignupData({...signupData, address: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceDay">Trash Service Day *</Label>
                    <Select
                      value={signupData.serviceDay}
                      onValueChange={(value) => setSignupData({...signupData, serviceDay: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your pickup day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
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

                  <div>
                    <Label htmlFor="loginPassword" className="text-slate-700 font-medium">Password *</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="Password"
                      className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                    
                  <div className="text-sm text-blue-700 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p>Enter either your phone number or email address and password to access your member dashboard.</p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Access Your Dashboard
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
    // Filter out the free plan from display
    const displayPlans = plans.filter(plan => plan.id !== 'free');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {renderNavigation()}
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center mb-12">
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
            {displayPlans.map((plan) => {
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
                      <span className="font-bold text-[28px]">{plan.name}</span>
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
                    >
                      Select Plan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            }            )}
          </div>

          <div className="text-center mt-12 space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Not ready for a subscription?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start with a free account and pay per service. You can upgrade anytime.
              </p>
              <Button 
                variant="outline"
                onClick={handleSkipPlan}
                className="text-blue-600 border-blue-300 hover:bg-blue-50 px-8"
              >
                Continue with Free Account
              </Button>
            </div>
            
            <div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your <span style={{color: '#87CEEB', fontWeight: 700, fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.08em'}}>regalcare</span> Benefits</h1>
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
                    <li>• Bins will be moved to curb by 10pm the night before, and returned by 10pm on your scheduled trash day</li>
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
          
          <div className="text-center mt-6 pt-6 border-t">
            <Button 
              variant="ghost"
              onClick={handleSkipPlan}
              className="text-blue-600 hover:text-blue-700"
            >
              Continue with Free Account Instead
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
            <p className="text-gray-600">Complete your <span style={{color: '#87CEEB', fontWeight: 700, fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.08em'}}>regalcare</span> subscription</p>
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
                    >
                      Complete Purchase
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
              <CardTitle className="text-2xl text-green-600">Welcome to <span style={{color: '#87CEEB', fontWeight: 700, fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.08em'}}>regalcare</span>!</CardTitle>
              <p className="text-gray-600">Your subscription is now active</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Account Details</h3>
                <p className="text-sm text-gray-600">Name: {signupData.name || createdCustomer?.name || user?.name}</p>
                <p className="text-sm text-gray-600">Phone: {signupData.phone || createdCustomer?.phone || user?.phone}</p>
                <p className="text-sm text-gray-600">Address: {signupData.address || createdCustomer?.address || user?.address}</p>
                <p className="text-sm text-gray-600">Service Day: {signupData.serviceDay ? signupData.serviceDay.charAt(0).toUpperCase() + signupData.serviceDay.slice(1) : 'Not specified'}</p>
                {selectedPlanData ? (
                  <p className="text-sm text-gray-600">Plan: {selectedPlanData.name} {selectedPlanData.price > 0 ? `(${selectedPlanData.price}/month)` : '(Free)'}</p>
                ) : (
                  <p className="text-sm text-gray-600">Plan: Free (No subscription)</p>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
                <p className="text-sm text-blue-700">Don't worry about remembering trash day anymore,<br />we got it!</p>
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
                    setSignupData({ name: "", phone: "", email: "", address: "", password: "", serviceDay: "" });
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

  if (step === 'member' && user?.role === 'customer') {
    return <MemberDashboard />;
  }

  return null;
}