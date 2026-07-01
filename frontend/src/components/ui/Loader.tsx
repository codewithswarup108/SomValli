import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => { if(onComplete) onComplete() }, 800); // 800ms for exit animation
    }, 3000); // 3 seconds before vanishing
    return () => clearTimeout(timer);
  }, [onComplete]);

  const text = "SomValli - The taste of Coffee";
  
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };
  
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200 } }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-[#1a1210] flex flex-col items-center justify-center"
        >
          {/* Subtle animated background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3E2723]/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
          
          <motion.div 
            className="z-10 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-playfair font-bold text-accent tracking-wider flex justify-center flex-wrap gap-2 px-4">
              {text.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-flex whitespace-nowrap">
                  {word.split("").map((char, index) => (
                    <motion.span key={index} variants={letterVariants} className={wordIndex === 0 ? "text-gradient-gold" : "text-white"}>
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
