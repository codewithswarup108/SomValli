import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedText from './AnimatedText';
import LogoAnimation from './LogoAnimation';
import ParticleBackground from './ParticleBackground';
import LuxuryLoader from './LuxuryLoader';

type SplashScreenProps = { onComplete?: () => void };

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(false);
      window.setTimeout(() => onComplete?.(), 650);
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_#5a3822_0%,_#251612_48%,_#100b0a_100%)] px-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(234,177,74,0.2),_transparent_42%)]" />
          <ParticleBackground />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.65 }}
            className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6"
          >
            <LogoAnimation />
              <AnimatedText text="SomValli Foods" />
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.15, duration: 0.65 }}
                className="mt-4 space-y-1 text-xs sm:text-sm md:text-base font-medium uppercase tracking-[0.18em] text-cream/75"
            >
              <p>Premium Foods</p>
              <p>Taste of Tradition</p>
              <p>Crafted with Quality</p>
            </motion.div>
            <LuxuryLoader />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
