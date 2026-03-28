import React from 'react';
import { motion } from 'motion/react';

export function BackgroundPaths() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
      <svg className="w-full h-full opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#c59aff', stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: '#c59aff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#c59aff', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        
        {[...Array(6)].map((_, i) => (
          <motion.path
            key={i}
            d={`M ${-100 + i * 200} ${1000} Q ${500} ${500} ${1100 - i * 200} ${0}`}
            stroke="url(#grad1)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0, 1, 0],
              pathOffset: [0, 1]
            }}
            transition={{ 
              duration: 8 + i * 2, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 2
            }}
          />
        ))}

        {[...Array(4)].map((_, i) => (
          <motion.circle
            key={`c-${i}`}
            r="2"
            fill="#c59aff"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ 
              duration: 10 + i * 3, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 2.5
            }}
            style={{ 
              offsetPath: `path('M ${-100 + i * 300} ${1000} Q ${500} ${500} ${1100 - i * 300} ${0}')`,
              filter: 'blur(2px)'
            }}
          />
        ))}
      </svg>
    </div>
  );
}
