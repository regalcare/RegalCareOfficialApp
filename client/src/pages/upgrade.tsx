import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "./schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/IMG_2051.jpeg";

export default function UpgradePage() {
  const params = useParams();
  const customerId = parseInt(params.id || "1");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  // Fetch customer data
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });
  
  const customerData = customers?.find(c => c.id === customerId);
  
  // Form state for payment
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Upgrade Successful!",
        description: "Welcome to the Ultimate plan! Your new benefits are now active.",
      });
      setIsProcessing(false);
      setLocation(`/customer/member/${customerId}`);
    }, 3000);
  };

  // Loading states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!customerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer not found</h2>
          <Button onClick={() => setLocation('/customer')}>
            Return to Portal
          </Button>
        </div>
      </div>
    );
  }

  const currentPlan = customerData.plan || 'basic';
  const isUpgradingFromPremium = currentPlan === 'premium';
  
  // Ultimate plan actual pricing
  const ultimateMonthlyPrice = 199.99;
  const ultimateYearlyPrice = 1990;
  
  // Calculate upgrade pricing (difference from current plan)
  const currentMonthlyPrice = isUpgradingFromPremium ? 99.99 : 59.99;
  const currentYearlyPrice = isUpgradingFromPremium ? 1089 : 660;
  
  const monthlyUpgradePrice = ultimateMonthlyPrice - currentMonthlyPrice;
  const yearlyUpgradePrice = ultimateYearlyPrice - currentYearlyPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/customer/member/${customerId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Regalcare Logo" 
              className="w-14 h-14 object-contain"
            />
            <span className="text-lg font-semibold"><span style={{color: '#87CEEB', fontWeight: 700, fontFamily: 'Futura, -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.08em'}}>regalcare</span> upgrade</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Crown className="h-12 w-12 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-purple-800">Ultimate Plan</CardTitle>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  ${billingCycle === 'monthly' ? ultimateMonthlyPrice : ultimateYearlyPrice}
                </div>
                <div className="text-sm text-purple-600">
                  {billingCycle === 'monthly' ? 'per month' : 'per year'}
                </div>
                {billingCycle === 'yearly' && (
                  <Badge variant="secondary" className="mt-2">
                    Save ${((ultimateMonthlyPrice * 12) - ultimateYearlyPrice).toFixed(2)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-sm font-medium">Billing Cycle:</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBillingCycle('monthly')}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBillingCycle('yearly')}
                  >
                    Yearly
                  </Button>
                </div>

                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-purple-800">Ultimate Plan Benefits:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Weekly trash bin valet (4+ cans)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">4 FREE bin cleanings quarterly</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-semibold">50% discount on all pressure washing services</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Priority scheduling</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Reliable customer support</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold text-purple-800 mb-2">Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</h4>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpgradeSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      type="text"
                      value={paymentData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        value={paymentData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={paymentData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Input
                      id="billingAddress"
                      type="text"
                      value={paymentData.billingAddress}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        value={paymentData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        value={paymentData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="NY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        value={paymentData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">
                      ${billingCycle === 'monthly' ? ultimateMonthlyPrice : ultimateYearlyPrice}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually'}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Upgrade to Ultimate - $${billingCycle === 'monthly' ? ultimateMonthlyPrice : ultimateYearlyPrice}`
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Your payment is secure and encrypted. You can cancel anytime.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}