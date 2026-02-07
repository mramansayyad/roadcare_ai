import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Clock, CheckCircle, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { motion, AnimatePresence } from "framer-motion";

export default function ReportsTable({ reports, onUpdateStatus, isUpdating, onViewDetails }) {
  return (
    <Card>
      <CardHeader className="bg-[#1a365d] text-white py-3 px-4">
        <CardTitle className="text-lg">Recent Reports</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Image</TableHead>
                <TableHead className="font-semibold text-gray-700">Complaint ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Damage Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                <TableHead className="font-semibold text-gray-700">Department</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Time</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        {report.image ? (
                          <img 
                            src={report.image} 
                            alt="Damage" 
                            className="w-16 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium text-[#1a365d]">
                        #{report.complaintId}
                      </TableCell>
                      <TableCell className="font-medium">{report.damageType}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={report.priority} />
                      </TableCell>
                      <TableCell className="text-sm">{report.department}</TableCell>
                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {report.created_date 
                          ? format(new Date(report.created_date), "dd MMM, HH:mm")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              {isUpdating === report.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails(report)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {report.status !== "In Progress" && (
                              <DropdownMenuItem 
                                onClick={() => onUpdateStatus(report.id, "In Progress")}
                                className="text-blue-600"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Mark In Progress
                              </DropdownMenuItem>
                            )}
                            {report.status !== "Resolved" && (
                              <DropdownMenuItem 
                                onClick={() => onUpdateStatus(report.id, "Resolved")}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}