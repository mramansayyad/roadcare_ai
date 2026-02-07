import React from 'react';
import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status, size = "default" }) {
  const statusConfig = {
    Pending: {
      bg: "bg-yellow-100 hover:bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-300",
    },
    "In Progress": {
      bg: "bg-blue-100 hover:bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
    },
    Resolved: {
      bg: "bg-green-100 hover:bg-green-100",
      text: "text-green-800",
      border: "border-green-300",
    },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <Badge 
      className={`${config.bg} ${config.text} ${config.border} border font-medium ${sizeClass}`}
    >
      {status}
    </Badge>
  );
}