import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import TabNavigation from "@/components/layout/tab-navigation";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Routes from "@/pages/routes";
import Messages from "@/pages/messages";
import BinCleaning from "@/pages/bin-cleaning";
import CustomerPortal from "@/pages/customer-portal";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const isCustomerPortal = location.startsWith('/customer');

  if (isCustomerPortal) {
    return (
      <Switch>
        <Route path="/customer" component={CustomerPortal} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/customers" component={Customers} />
          <Route path="/routes" component={Routes} />
          <Route path="/messages" component={Messages} />
          <Route path="/bin-cleaning" component={BinCleaning} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
