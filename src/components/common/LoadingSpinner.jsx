import React from 'react';
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoadingSpinner({ message = "Loading...", fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-10 h-10 text-[#FF9933]" />
      </motion.div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center">
      {content}
    </div>
  );
}