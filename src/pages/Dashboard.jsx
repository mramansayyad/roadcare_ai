import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import StatsCard from '@/components/dashboard/StatsCard';
import ReportsMap from '@/components/dashboard/ReportsMap';
import ReportsTable from '@/components/dashboard/ReportsTable';
import FilterBar from '@/components/dashboard/FilterBar';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Dashboard() {
  const [filters, setFilters] = useState({
    priority: "all",
    department: "all",
    status: "all",
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-created_date', 100),
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Report.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setIsUpdating(null);
    },
  });

  const handleUpdateStatus = async (id, newStatus) => {
    setIsUpdating(id);
    const updateData = { status: newStatus };
    if (newStatus === "Resolved") {
      updateData.resolvedAt = new Date().toISOString();
    }
    updateMutation.mutate({ id, data: updateData });
  };

  if (authLoading) {
    return <LoadingSpinner message="Checking authentication..." fullScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FF9933]/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-[#FF9933]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a365d] mb-4">Officer Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to access the command dashboard.
          </p>
          <Button
            className="bg-[#FF9933] hover:bg-[#e68a00]"
            onClick={() => base44.auth.redirectToLogin()}
          >
            Login as Officer
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." fullScreen />;
  }

  // Calculate stats
  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.priority === "Critical").length,
    pending: reports.filter(r => r.status === "Pending").length,
    resolved: reports.filter(r => r.status === "Resolved").length,
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    if (filters.priority !== "all" && report.priority !== filters.priority) return false;
    if (filters.department !== "all" && report.department !== filters.department) return false;
    if (filters.status !== "all" && report.status !== filters.status) return false;
    return true;
  });

  const departments = [...new Set(reports.map(r => r.department).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a365d] mb-2">Command Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.full_name || 'Officer'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Reports"
            value={stats.total}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Critical Issues"
            value={stats.critical}
            icon={AlertTriangle}
            color="red"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="saffron"
          />
          <StatsCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {/* Map */}
        <div className="mb-8">
          <ReportsMap reports={filteredReports} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            departments={departments}
          />
        </div>

        {/* Reports Table */}
        <ReportsTable 
          reports={filteredReports}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
          onViewDetails={setSelectedReport}
        />

        {/* Report Details Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedReport && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-[#1a365d]">
                    Complaint #{selectedReport.complaintId}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedReport.image && (
                    <img 
                      src={selectedReport.image} 
                      alt="Damage" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Damage Type</p>
                      <p className="font-semibold">{selectedReport.damageType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <p className="font-semibold">{selectedReport.priority}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-semibold">{selectedReport.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold">{selectedReport.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Confidence</p>
                      <p className="font-semibold">{(selectedReport.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reported</p>
                      <p className="font-semibold">
                        {selectedReport.created_date 
                          ? format(new Date(selectedReport.created_date), "dd MMM yyyy, HH:mm")
                          : "-"
                        }
                      </p>
                    </div>
                    {selectedReport.reporterName && (
                      <div>
                        <p className="text-sm text-gray-500">Reporter</p>
                        <p className="font-semibold">{selectedReport.reporterName}</p>
                      </div>
                    )}
                    {selectedReport.reporterPhone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-semibold">{selectedReport.reporterPhone}</p>
                      </div>
                    )}
                  </div>

                  {selectedReport.latitude && selectedReport.longitude && (
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">
                        {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
                      </p>
                      <a 
                        href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#FF9933] hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    {selectedReport.status !== "In Progress" && (
                      <Button
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                        onClick={() => {
                          handleUpdateStatus(selectedReport.id, "In Progress");
                          setSelectedReport(null);
                        }}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {selectedReport.status !== "Resolved" && (
                      <Button
                        className="flex-1 bg-[#138808] hover:bg-[#0f6b06]"
                        onClick={() => {
                          handleUpdateStatus(selectedReport.id, "Resolved");
                          setSelectedReport(null);
                        }}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}