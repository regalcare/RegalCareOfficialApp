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
  const [step, setStep] = useState<'signup' | 'plans' | 'confirmation'>('signup');
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { toast } = useToast();

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      await apiRequest("POST", "/api/customers", customerData);
    },
    onSuccess: () => {
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

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const selectedPlanData = plans.find(p => p.id === planId);
    
    createCustomerMutation.mutate({
      ...signupData,
      route: "Route A", // Default route assignment
      status: "active",
      plan: planId,
      monthlyRate: selectedPlanData?.price || 25
    });
  };

  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to regal care</CardTitle>
            <p className="text-gray-600">Sign up for professional waste management service</p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'plans') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
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

  if (step === 'confirmation') {
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Welcome to regal care!</CardTitle>
            <p className="text-gray-600">Your account has been successfully created</p>
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

            <Button 
              className="w-full" 
              onClick={() => {
                setStep('signup');
                setSignupData({ name: "", phone: "", email: "", address: "" });
                setSelectedPlan("");
              }}
            >
              Sign Up Another Customer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}