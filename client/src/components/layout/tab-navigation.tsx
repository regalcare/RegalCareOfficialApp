import { useLocation } from "wouter";
import { Link } from "wouter";
import { BarChart3, Users, Route, Mail, SprayCan } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Message } from "@shared/schema";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/" },
  { id: "customers", label: "Customers", icon: Users, path: "/customers" },
  { id: "routes", label: "Weekly Routes", icon: Route, path: "/routes" },
  { id: "messages", label: "Messages", icon: Mail, path: "/messages" },
  { id: "bin-cleaning", label: "Bin Cleaning", icon: SprayCan, path: "/bin-cleaning" },
];

export default function TabNavigation() {
  const [location] = useLocation();
  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const unreadCount = messages?.filter(msg => !msg.isRead).length || 0;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location === tab.path;
            
            return (
              <Link key={tab.id} href={tab.path}>
                <button
                  className={cn(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === "messages" && unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
