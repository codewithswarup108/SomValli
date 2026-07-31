import React from 'react';
import { motion } from 'framer-motion';

type AnimatedTextProps = { text: string };

const AnimatedText: React.FC<AnimatedTextProps> = ({ text }) => (
  <h1 className="mt-5 flex flex-wrap justify-center gap-x-2 font-playfair text-4xl font-black tracking-[0.08em] text-gradient-gold sm:text-6xl">
    {text.split('').map((character, index) => (
      <motion.span
        key={`${character}-${index}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.25 + index * 0.045, duration: 0.35 }}
      >
        {character === ' ' ? '\u00a0' : character}
      </motion.span>
    ))}
  </h1>
);

export default AnimatedText;
