import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, Settings2, Users, Download, Plus, Trash2, Edit, 
  AlertTriangle, Loader2, Shield, BarChart3 
} from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");
  const [showAddDept, setShowAddDept] = useState(false);

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

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list(),
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: departments = [], isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list(),
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: priorityRules = [] } = useQuery({
    queryKey: ['priorityRules'],
    queryFn: () => base44.entities.PriorityRule.list(),
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const addDeptMutation = useMutation({
    mutationFn: (data) => base44.entities.Department.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setNewDeptName("");
      setNewDeptDesc("");
      setShowAddDept(false);
    },
  });

  const deleteDeptMutation = useMutation({
    mutationFn: (id) => base44.entities.Department.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  const toggleDeptMutation = useMutation({
    mutationFn: ({ id, isActive }) => base44.entities.Department.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  if (authLoading) {
    return <LoadingSpinner message="Checking authentication..." fullScreen />;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a365d] mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need admin privileges to access this page.
          </p>
          {!isAuthenticated && (
            <Button
              className="bg-[#FF9933] hover:bg-[#e68a00]"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Login as Admin
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  // Calculate performance stats
  const deptPerformance = {};
  reports.forEach(report => {
    if (!deptPerformance[report.department]) {
      deptPerformance[report.department] = { total: 0, resolved: 0, pending: 0, inProgress: 0 };
    }
    deptPerformance[report.department].total++;
    if (report.status === "Resolved") deptPerformance[report.department].resolved++;
    if (report.status === "Pending") deptPerformance[report.department].pending++;
    if (report.status === "In Progress") deptPerformance[report.department].inProgress++;
  });

  const exportToCSV = () => {
    const headers = ['Complaint ID', 'Damage Type', 'Priority', 'Department', 'Status', 'Date', 'Location'];
    const rows = reports.map(r => [
      r.complaintId,
      r.damageType,
      r.priority,
      r.department,
      r.status,
      r.created_date ? new Date(r.created_date).toLocaleDateString() : '',
      r.latitude && r.longitude ? `${r.latitude},${r.longitude}` : ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadcare-reports-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a365d] mb-2">Admin Settings</h1>
          <p className="text-gray-600">Manage departments, priority rules, and export data</p>
        </div>

        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="priority" className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Priority Rules
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Departments Tab */}
          <TabsContent value="departments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#1a365d]">Manage Departments</CardTitle>
                <Dialog open={showAddDept} onOpenChange={setShowAddDept}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#FF9933] hover:bg-[#e68a00]">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium">Department Name</label>
                        <Input
                          value={newDeptName}
                          onChange={(e) => setNewDeptName(e.target.value)}
                          placeholder="e.g., Engineering"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          value={newDeptDesc}
                          onChange={(e) => setNewDeptDesc(e.target.value)}
                          placeholder="Department description"
                        />
                      </div>
                      <Button
                        className="w-full bg-[#138808] hover:bg-[#0f6b06]"
                        onClick={() => addDeptMutation.mutate({ name: newDeptName, description: newDeptDesc, isActive: true })}
                        disabled={!newDeptName || addDeptMutation.isPending}
                      >
                        {addDeptMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Add Department"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deptsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : departments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No departments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      departments.map(dept => (
                        <TableRow key={dept.id}>
                          <TableCell className="font-medium">{dept.name}</TableCell>
                          <TableCell className="text-gray-600">{dept.description || "-"}</TableCell>
                          <TableCell>
                            <Switch
                              checked={dept.isActive !== false}
                              onCheckedChange={(checked) => toggleDeptMutation.mutate({ id: dept.id, isActive: checked })}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => deleteDeptMutation.mutate(dept.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Priority Rules Tab */}
          <TabsContent value="priority">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1a365d]">Priority Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <div>
                        <p className="font-semibold text-red-800">Critical Priority</p>
                        <p className="text-sm text-red-600">Severity Score &gt; 85%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500" />
                      <div>
                        <p className="font-semibold text-orange-800">High Priority</p>
                        <p className="text-sm text-orange-600">Severity Score 60% - 85%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      <div>
                        <p className="font-semibold text-yellow-800">Medium Priority</p>
                        <p className="text-sm text-yellow-600">Severity Score &lt; 60%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <p className="font-medium text-gray-700 mb-2">Department Assignment Rules:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Waterlogged damage → <span className="font-medium">Drainage Department</span></li>
                      <li>• All other damage types → <span className="font-medium">Engineering Department</span></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1a365d]">Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Total Reports</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>In Progress</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Resolution Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(deptPerformance).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      Object.entries(deptPerformance).map(([dept, stats]) => (
                        <TableRow key={dept}>
                          <TableCell className="font-medium">{dept}</TableCell>
                          <TableCell>{stats.total}</TableCell>
                          <TableCell className="text-yellow-600">{stats.pending}</TableCell>
                          <TableCell className="text-blue-600">{stats.inProgress}</TableCell>
                          <TableCell className="text-green-600">{stats.resolved}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#138808]"
                                  style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1a365d]">Export Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF9933]/10 flex items-center justify-center">
                    <Download className="w-8 h-8 text-[#FF9933]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1a365d] mb-2">Download All Reports</h3>
                  <p className="text-gray-600 mb-6">
                    Export all {reports.length} reports as a CSV file
                  </p>
                  <Button
                    className="bg-[#138808] hover:bg-[#0f6b06]"
                    onClick={exportToCSV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}