// App.tsx
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
import LoginPage from "@/pages/customer-portal"; // 👈 your actual login/signup lives here
import { useAuth } from "./lib/auth";

function Router() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
  if (isLoading) return; 
    if (!user) {
      setLocation("/login"); // 👈 go to your real login/signup page
    } else if (user.role === "admin") {
      setLocation("/dashboard");
    } else if (user.role === "customer") {
      setLocation("/customer");
    }
  }, [user, isLoading]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/customer" component={CustomerPortal} />
          <Route path="/customer/member/:id" component={CustomerPortal} />
          <Route path="/customer/upgrade/:id" component={UpgradePage} />
          <Route path="/login" component={LoginPage} /> {/* 👈 fixed */}
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
