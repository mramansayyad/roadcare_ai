import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export default function FilterBar({ filters, setFilters, departments }) {
  const handleClearFilters = () => {
    setFilters({
      priority: "all",
      department: "all",
      status: "all",
    });
  };

  const hasActiveFilters = filters.priority !== "all" || filters.department !== "all" || filters.status !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 text-[#1a365d] font-medium">
        <Filter className="w-4 h-4" />
        <span>Filters:</span>
      </div>
      
      <Select value={filters.priority} onValueChange={(v) => setFilters({...filters, priority: v})}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="Critical">Critical</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.department} onValueChange={(v) => setFilters({...filters, department: v})}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map(dept => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearFilters}
          className="text-gray-500 hover:text-red-500"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}