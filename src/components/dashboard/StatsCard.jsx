import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  const colorClasses = {
    saffron: "bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20",
    green: "bg-[#138808]/10 text-[#138808] border-[#138808]/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    blue: "bg-[#1a365d]/10 text-[#1a365d] border-[#1a365d]/20",
  };

  const iconBg = {
    saffron: "bg-[#FF9933]",
    green: "bg-[#138808]",
    red: "bg-red-500",
    blue: "bg-[#1a365d]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-5 border-2 ${colorClasses[color]} hover:shadow-lg transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-gray-500 mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconBg[color]} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}