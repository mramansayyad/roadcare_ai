import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, RefreshCw, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LocationPicker({ location, setLocation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoading(false);
      },
      (err) => {
        setError("Unable to get location. Please enable GPS.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            location ? 'bg-[#138808]/10' : 'bg-gray-100'
          }`}>
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-[#FF9933] animate-spin" />
            ) : location ? (
              <CheckCircle className="w-6 h-6 text-[#138808]" />
            ) : (
              <MapPin className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <p className="font-medium text-[#1a365d]">GPS Location</p>
            {isLoading ? (
              <p className="text-sm text-gray-500">Fetching location...</p>
            ) : location ? (
              <p className="text-sm text-[#138808]">
                📍 {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <p className="text-sm text-gray-500">Location not available</p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchLocation}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}