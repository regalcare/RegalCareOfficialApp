import { User, Users } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/IMG_2051.jpeg";

export default function Header() {

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Regalcare Logo" 
              className="w-14 h-14 object-contain"
            />
            <h1 className="text-xl font-bold text-gray-900">Business Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/customer">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-secondary/90">
                <Users size={16} />
                <span className="text-[12px]">Customer Portal</span>
              </button>
            </Link>

            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="text-gray-600" size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
