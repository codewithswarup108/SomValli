import React from 'react';
import { motion } from 'framer-motion';

const LogoAnimation: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7, rotate: 2 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="relative flex h-24 w-24 items-center justify-center rounded-full border border-accent/70 bg-primary shadow-[0_0_55px_rgba(226,166,61,0.38)] sm:h-28 sm:w-28"
  >
    <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-2 rounded-full border border-accent/50"
      />
      <img src="/hero.png" alt="SomValli Foods logo" className="w-12 h-12 object-contain sm:w-16 sm:h-16" />
  </motion.div>
);

export default LogoAnimation;
