import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Route as RouteIcon, Clock, Truck } from "lucide-react";
import type { Customer, Route } from "/server/schema";

interface RouteMapProps {
  customers: Customer[];
  routes: Route[];
  selectedRoute?: Route | null;
  onRouteOptimized?: (routeId: number, optimizedCustomers: Customer[]) => void;
}

interface Coordinate {
  lat: number;
  lng: number;
}

// Helper function to parse coordinates from address (demo implementation)
function parseCoordinates(address: string): Coordinate {
  // In a real implementation, you'd use a geocoding service like Google Maps or Mapbox
  // For demo purposes, we'll create mock coordinates based on address hash
  const hash = address.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Base coordinates for a neighborhood (adjust for your area)
  const baseLat = 40.7128; // New York City example
  const baseLng = -74.0060;
  
  // Create variation within a neighborhood (~1 mile radius)
  const latVariation = (hash % 200) / 10000; // ±0.02 degrees (about 1.4 miles)
  const lngVariation = ((hash >> 8) % 200) / 10000;
  
  return {
    lat: baseLat + latVariation,
    lng: baseLng + lngVariation
  };
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function RouteMap({ customers, routes, selectedRoute, onRouteOptimized }: RouteMapProps) {
  const [optimizedRoute, setOptimizedRoute] = useState<Coordinate[]>([]);
  const [showOptimizedRoute, setShowOptimizedRoute] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [routeStats, setRouteStats] = useState({
    totalDistance: 0,
    estimatedTime: 0,
    customerCount: 0
  });

  // Filter customers for selected route
  const routeCustomers = selectedRoute 
    ? customers.filter(customer => customer.route === selectedRoute.name)
    : customers;

  // Optimize route using simple nearest neighbor algorithm
  const optimizeRouteOrder = (customers: Customer[]): Customer[] => {
    if (customers.length <= 1) return customers;
    
    const unvisited = [...customers];
    const visited: Customer[] = [];
    
    // Start with first customer
    let current = unvisited.shift()!;
    visited.push(current);
    
    while (unvisited.length > 0) {
      const currentCoords = parseCoordinates(current.address);
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      
      unvisited.forEach((customer, index) => {
        const customerCoords = parseCoordinates(customer.address);
        const distance = calculateDistance(currentCoords, customerCoords);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      
      current = unvisited.splice(nearestIndex, 1)[0];
      visited.push(current);
    }
    
    return visited;
  };

  // Calculate route statistics
  useEffect(() => {
    if (routeCustomers.length > 0) {
      const optimizedCustomers = optimizeRouteOrder(routeCustomers);
      const optimizedCoordinates = optimizedCustomers.map(customer => parseCoordinates(customer.address));
      setOptimizedRoute(optimizedCoordinates);
      
      // Calculate total distance
      let totalDistance = 0;
      for (let i = 0; i < optimizedCoordinates.length - 1; i++) {
        const distance = calculateDistance(optimizedCoordinates[i], optimizedCoordinates[i + 1]);
        totalDistance += distance;
      }
      
      // Estimate time (2 minutes per mile + 3 minutes per stop)
      const estimatedTime = Math.round(totalDistance * 2 + optimizedCustomers.length * 3);
      
      setRouteStats({
        totalDistance: Math.round(totalDistance * 100) / 100,
        estimatedTime,
        customerCount: routeCustomers.length
      });
    }
  }, [routeCustomers]);

  const handleOptimizeRoute = () => {
    if (selectedRoute && onRouteOptimized) {
      const optimizedCustomers = optimizeRouteOrder(routeCustomers);
      onRouteOptimized(selectedRoute.id, optimizedCustomers);
    }
  };

  // Create route line GeoJSON
  const routeLineGeoJSON = showOptimizedRoute && optimizedRoute.length > 1 ? {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: optimizedRoute.map(coord => [coord.lng, coord.lat])
    }
  } : null;

  return (
    <div className="space-y-4">
      {/* Route Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Route Map</h3>
          <p className="text-sm text-gray-600">
            {selectedRoute ? `Showing ${selectedRoute.name}` : 'Showing all customers'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={showOptimizedRoute ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOptimizedRoute(!showOptimizedRoute)}
          >
            <RouteIcon className="mr-2" size={16} />
            {showOptimizedRoute ? 'Hide Route' : 'Show Route'}
          </Button>
          {selectedRoute && (
            <Button
              size="sm"
              onClick={handleOptimizeRoute}
              disabled={routeCustomers.length === 0}
            >
              <Navigation className="mr-2" size={16} />
              Optimize Route
            </Button>
          )}
        </div>
      </div>

      {/* Route Stats */}
      {showOptimizedRoute && routeStats.customerCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck size={16} />
              <span>Route Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{routeStats.customerCount}</p>
                <p className="text-sm text-gray-600">Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{routeStats.totalDistance}</p>
                <p className="text-sm text-gray-600">Miles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{routeStats.estimatedTime}</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Map Visualization */}
      <div className="h-96 w-full rounded-lg overflow-hidden border bg-gray-50 relative">
        <svg width="100%" height="100%" viewBox="0 0 800 400" className="w-full h-full">
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Streets */}
          <g stroke="#9ca3af" strokeWidth="2" fill="none">
            <line x1="100" y1="50" x2="700" y2="50" />
            <line x1="100" y1="150" x2="700" y2="150" />
            <line x1="100" y1="250" x2="700" y2="250" />
            <line x1="100" y1="350" x2="700" y2="350" />
            <line x1="150" y1="10" x2="150" y2="390" />
            <line x1="300" y1="10" x2="300" y2="390" />
            <line x1="450" y1="10" x2="450" y2="390" />
            <line x1="600" y1="10" x2="600" y2="390" />
          </g>
          
          {/* Route Line */}
          {showOptimizedRoute && optimizedRoute.length > 1 && (
            <g>
              <path
                d={`M ${optimizedRoute.map((coord, index) => {
                  const x = ((coord.lng + 74.0060) * 50000) % 800;
                  const y = ((coord.lat - 40.7128) * 50000) % 400;
                  return `${x},${y}`;
                }).join(' L ')}`}
                stroke="#3B82F6"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
              />
            </g>
          )}
          
          {/* Customer Markers */}
          {routeCustomers.map((customer, index) => {
            const coords = parseCoordinates(customer.address);
            const x = ((coords.lng + 74.0060) * 50000) % 800;
            const y = ((coords.lat - 40.7128) * 50000) % 400;
            
            return (
              <g key={customer.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  fill={selectedCustomer?.id === customer.id ? "#DC2626" : "#3B82F6"}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedCustomer(selectedCustomer?.id === customer.id ? null : customer)}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  className="cursor-pointer pointer-events-none"
                >
                  {index + 1}
                </text>
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform="translate(20, 20)">
            <rect width="180" height="80" fill="white" stroke="#d1d5db" strokeWidth="1" rx="4"/>
            <text x="10" y="20" fontSize="12" fontWeight="bold">Map Legend</text>
            <circle cx="20" cy="35" r="6" fill="#3B82F6"/>
            <text x="35" y="40" fontSize="10">Customer Location</text>
            <line x1="15" y1="55" x2="35" y2="55" stroke="#3B82F6" strokeWidth="2" strokeDasharray="2,2"/>
            <text x="40" y="60" fontSize="10">Optimized Route</text>
          </g>
        </svg>
        
        {/* Customer Info Panel */}
        {selectedCustomer && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{selectedCustomer.name}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-1">{selectedCustomer.address}</p>
            <p className="text-sm text-gray-600 mb-2">Phone: {selectedCustomer.phone}</p>
            <Badge variant="outline">
              {selectedCustomer.route}
            </Badge>
          </div>
        )}
      </div>

      {/* Customer List for Selected Route */}
      {selectedRoute && routeCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin size={16} />
              <span>Customers on {selectedRoute.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {routeCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.address}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{customer.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}