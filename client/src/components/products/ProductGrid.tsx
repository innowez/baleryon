"use client";

import { motion } from "motion/react";

type ProductGridProps = {
  children: React.ReactNode;
};

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
    >
      {children}
    </motion.div>
  );
}
