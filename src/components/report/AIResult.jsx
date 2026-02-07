import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Brain, AlertTriangle, Building2, Percent } from "lucide-react";
import PriorityBadge from '../dashboard/PriorityBadge';

export default function AIResult({ result }) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-[#1a365d]/20 bg-gradient-to-br from-[#1a365d]/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#1a365d] flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold text-[#1a365d]">AI Analysis Result</p>
          </div>

          {result.reasoning && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-900">{result.reasoning}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <AlertTriangle className="w-4 h-4" />
                Damage Type
              </div>
              <p className="font-semibold text-[#1a365d]">{result.damageType}</p>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Percent className="w-4 h-4" />
                Confidence
              </div>
              <p className="font-semibold text-[#1a365d]">
                {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Building2 className="w-4 h-4" />
                Department
              </div>
              <p className="font-semibold text-[#1a365d]">{result.department}</p>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-500 mb-1">Priority</div>
              <PriorityBadge priority={result.priority} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}