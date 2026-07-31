import React from 'react';
import { motion } from 'framer-motion';

const LuxuryLoader: React.FC = () => (
  <div className="mt-10 w-56 sm:w-72">
    <div className="h-1 overflow-hidden rounded-full bg-white/15">
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 3.55, ease: 'easeInOut' }}
        className="relative h-full rounded-full bg-gradient-to-r from-accent via-[#ffe7a8] to-accent shadow-[0_0_18px_rgba(226,166,61,0.8)]"
      >
        <span className="absolute inset-y-0 right-0 w-12 bg-white/60 blur-md" />
      </motion.div>
    </div>
    <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-cream/55">Preparing your table</p>
  </div>
);

export default LuxuryLoader;
