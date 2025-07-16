import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import TabNavigation from "@/components/layout/tab-navigation";
import Dashboard from "@/pages/dashboard";
import CustomerPortal from "@/pages/customer-portal";
import UpgradePage from "@/pages/upgrade";
import NotFound from "@/pages/not-found";
import { useAuth } from "./lib/auth";

// Simulated auth check (replace with real one)
// ← set this dynamically from your auth state

function RedirectToCustomer() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/customer");
  }, []);
  return null;
}

function Router() {
  const [location] = useLocation();
  const isCustomerPortal = location.startsWith("/customer");
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (isCustomerPortal) {
    return (
      <Switch>
        <Route path="/customer" component={CustomerPortal} />
        <Route path="/customer/member/:id" component={CustomerPortal} />
        <Route path="/customer/upgrade/:id" component={UpgradePage} />
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
          <Route
            path="/"
            component={() =>
              user?.role === "admin" ? <Dashboard /> : <RedirectToCustomer />
            }
          />
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
