'use client';

import { motion } from 'framer-motion';

export function StudentScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      <svg
        viewBox="0 0 500 400"
        className="w-[80%] max-w-[500px] opacity-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow behind student */}
        <ellipse cx="250" cy="280" rx="140" ry="80" fill="url(#glowGrad)" opacity="0.3" />

        {/* Desk */}
        <motion.path
          d="M120 300 L380 300 L400 340 L100 340 Z"
          fill="rgba(139,92,246,0.08)"
          stroke="rgba(139,92,246,0.2)"
          strokeWidth="1"
        />
        <motion.path
          d="M100 340 L110 380 M400 340 L390 380"
          stroke="rgba(139,92,246,0.15)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Laptop base */}
        <motion.path
          d="M180 295 L320 295 L330 305 L170 305 Z"
          fill="rgba(6,182,212,0.1)"
          stroke="rgba(6,182,212,0.25)"
          strokeWidth="1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        {/* Laptop screen */}
        <motion.path
          d="M195 225 L305 225 L305 295 L195 295 Z"
          fill="rgba(6,182,212,0.06)"
          stroke="rgba(6,182,212,0.2)"
          strokeWidth="1"
          rx="4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        {/* Screen glow lines */}
        <motion.path
          d="M210 245 L290 245 M210 255 L270 255 M210 265 L280 265 M210 275 L260 275"
          stroke="rgba(6,182,212,0.3)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        />

        {/* Student body */}
        <motion.g
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Torso */}
          <path
            d="M210 300 L210 220 C210 200 230 190 250 190 C270 190 290 200 290 220 L290 300"
            fill="rgba(139,92,246,0.1)"
            stroke="rgba(139,92,246,0.25)"
            strokeWidth="1.5"
          />
          {/* Head */}
          <circle cx="250" cy="165" r="28" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
          {/* Face features (subtle) */}
          <circle cx="242" cy="162" r="2.5" fill="rgba(139,92,246,0.5)" />
          <circle cx="258" cy="162" r="2.5" fill="rgba(139,92,246,0.5)" />
          <path d="M246 172 Q250 176 254 172" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Hair */}
          <path
            d="M222 155 Q250 130 278 155 Q280 165 275 170 Q250 145 225 170 Q220 165 222 155"
            fill="rgba(139,92,246,0.15)"
            stroke="rgba(139,92,246,0.2)"
            strokeWidth="1"
          />
        </motion.g>

        {/* Arms */}
        <motion.path
          d="M210 230 Q190 260 200 290"
          stroke="rgba(139,92,246,0.25)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
        <motion.path
          d="M290 230 Q310 260 300 290"
          stroke="rgba(139,92,246,0.25)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />

        {/* Floating elements */}
        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Floating book left */}
          <rect x="80" y="180" width="36" height="28" rx="3" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
          <path d="M88 188 L108 188 M88 196 L104 196" stroke="rgba(245,158,11,0.4)" strokeWidth="1" strokeLinecap="round" />
        </motion.g>

        <motion.g
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          {/* Floating book right */}
          <rect x="380" y="160" width="32" height="24" rx="3" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
          <path d="M387 167 L405 167 M387 174 L402 174" stroke="rgba(16,185,129,0.4)" strokeWidth="1" strokeLinecap="round" />
        </motion.g>

        <motion.g
          animate={{ y: [0, -6, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          {/* Lightbulb */}
          <circle cx="360" cy="100" r="14" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.35)" strokeWidth="1" />
          <path d="M354 108 Q360 114 366 108" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Bulb rays */}
          <path d="M360 78 L360 82 M360 118 L360 122 M340 100 L344 100 M376 100 L380 100" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeLinecap="round" />
        </motion.g>

        <motion.g
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          {/* Atom / science symbol */}
          <circle cx="130" cy="110" r="12" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
          <ellipse cx="130" cy="110" rx="18" ry="6" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
          <ellipse cx="130" cy="110" rx="18" ry="6" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1" transform="rotate(60 130 110)" />
          <ellipse cx="130" cy="110" rx="18" ry="6" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="1" transform="rotate(120 130 110)" />
        </motion.g>

        {/* Small floating dots */}
        {[ 
          { cx: 100, cy: 260, r: 3, color: 'rgba(139,92,246,0.4)' },
          { cx: 400, cy: 240, r: 2.5, color: 'rgba(6,182,212,0.4)' },
          { cx: 150, cy: 140, r: 2, color: 'rgba(245,158,11,0.4)' },
          { cx: 340, cy: 260, r: 3, color: 'rgba(16,185,129,0.3)' },
          { cx: 420, cy: 200, r: 2, color: 'rgba(139,92,246,0.3)' },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill={dot.color}
            animate={{ y: [0, -5, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}

        {/* Gradients */}
        <defs>
          <radialGradient id="glowGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
