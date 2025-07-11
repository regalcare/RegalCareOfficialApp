import { Bell, User, Truck, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Message } from "@shared/schema";

export default function Header() {
  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const unreadCount = messages?.filter(msg => !msg.isRead).length || 0;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">regal care Business Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/customer">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-secondary/90">
                <Users size={16} />
                <span>Customer Portal</span>
              </button>
            </Link>
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="text-gray-600" size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
