import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function PriorityBadge({ priority, showIcon = true }) {
  const priorityConfig = {
    Critical: {
      bg: "bg-red-100 hover:bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
      icon: AlertTriangle,
    },
    High: {
      bg: "bg-orange-100 hover:bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-300",
      icon: AlertCircle,
    },
    Medium: {
      bg: "bg-yellow-100 hover:bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-300",
      icon: Info,
    },
  };

  const config = priorityConfig[priority] || priorityConfig.Medium;
  const Icon = config.icon;

  return (
    <Badge 
      className={`${config.bg} ${config.text} ${config.border} border font-medium flex items-center gap-1`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {priority}
    </Badge>
  );
}