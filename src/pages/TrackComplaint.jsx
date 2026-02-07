import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Loader2, MapPin, Clock, Building2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import StatusBadge from '@/components/dashboard/StatusBadge';
import PriorityBadge from '@/components/dashboard/PriorityBadge';

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!complaintId.trim()) {
      setError("Please enter a complaint ID");
      return;
    }

    setIsSearching(true);

    const reports = await base44.entities.Report.filter({ complaintId: complaintId.trim().toUpperCase() });

    if (reports.length === 0) {
      setError("No complaint found with this ID. Please check and try again.");
    } else {
      setResult(reports[0]);
    }

    setIsSearching(false);
  };

  const statusTimeline = [
    { status: "Pending", icon: Clock, label: "Report Received" },
    { status: "In Progress", icon: Building2, label: "Work In Progress" },
    { status: "Resolved", icon: CheckCircle2, label: "Issue Resolved" },
  ];

  const getStatusIndex = (status) => {
    return statusTimeline.findIndex(s => s.status === status);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a365d] mb-2">Track Your Complaint</h1>
          <p className="text-gray-600">अपनी शिकायत की स्थिति जांचें</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Complaint ID / शिकायत आईडी दर्ज करें
                </label>
                <Input
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  placeholder="e.g., SMC202401011234"
                  className="h-12 text-lg font-mono"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#FF9933] hover:bg-[#e68a00] h-12"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track Complaint
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-[#1a365d]/20">
                <CardHeader className="bg-[#1a365d] text-white py-4">
                  <CardTitle className="flex items-center justify-between">
                    <span>Complaint #{result.complaintId}</span>
                    <StatusBadge status={result.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Image */}
                  {result.image && (
                    <img 
                      src={result.image} 
                      alt="Damage" 
                      className="w-full h-48 object-cover rounded-lg mb-6"
                    />
                  )}

                  {/* Status Timeline */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#1a365d] mb-4">Status Timeline</h3>
                    <div className="flex items-center justify-between relative">
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
                        <div 
                          className="h-full bg-[#138808] transition-all duration-500"
                          style={{ width: `${(getStatusIndex(result.status) / (statusTimeline.length - 1)) * 100}%` }}
                        />
                      </div>
                      
                      {statusTimeline.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index <= getStatusIndex(result.status);
                        const isCurrent = step.status === result.status;
                        
                        return (
                          <div key={step.status} className="flex flex-col items-center z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isActive 
                                ? 'bg-[#138808] text-white' 
                                : 'bg-gray-200 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-[#138808]/30' : ''}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs mt-2 text-center max-w-[80px] ${
                              isActive ? 'text-[#138808] font-medium' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        Damage Type
                      </div>
                      <p className="font-semibold text-[#1a365d]">{result.damageType}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Priority</div>
                      <PriorityBadge priority={result.priority} />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Building2 className="w-4 h-4" />
                        Department
                      </div>
                      <p className="font-semibold text-[#1a365d]">{result.department}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Clock className="w-4 h-4" />
                        Reported On
                      </div>
                      <p className="font-semibold text-[#1a365d]">
                        {result.created_date 
                          ? format(new Date(result.created_date), "dd MMM yyyy")
                          : "-"
                        }
                      </p>
                    </div>

                    {result.latitude && result.longitude && (
                      <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <MapPin className="w-4 h-4" />
                          Location
                        </div>
                        <p className="font-semibold text-[#1a365d]">
                          {result.latitude.toFixed(5)}, {result.longitude.toFixed(5)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {result.notes && (
                    <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800 mb-1">Officer Notes:</p>
                      <p className="text-sm text-yellow-700">{result.notes}</p>
                    </div>
                  )}

                  {/* Resolution Info */}
                  {result.status === "Resolved" && result.resolvedAt && (
                    <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium text-green-800">
                          Resolved on {format(new Date(result.resolvedAt), "dd MMM yyyy, HH:mm")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}