import React, { useState, useEffect } from 'react';

interface LoadingPotProps {
  size?: number;
  messages?: string[]; // Changed from single message to array
  variant?: 'cooking' | 'searching'; // New variant prop
  lightMode?: boolean;
}

const LoadingPot: React.FC<LoadingPotProps> = ({ 
  size = 100, 
  messages = ["Carregando..."], 
  variant = 'cooking',
  lightMode = false 
}) => {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setFadeKey(prev => prev + 1); // Trigger animation restart
      setCurrentMsgIndex(prev => (prev + 1) % messages.length);
    }, 2500); // Change message every 2.5s

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          
          {variant === 'cooking' ? (
            // --- COOKING POT ANIMATION ---
            <g>
               {/* Steam - Animated */}
              <g className="animate-steam" style={{ animationDelay: '0s' }}>
                <circle cx="35" cy="20" r="3" className="fill-stone-300 opacity-50" />
              </g>
              <g className="animate-steam" style={{ animationDelay: '1s' }}>
                <circle cx="50" cy="15" r="4" className="fill-stone-300 opacity-50" />
              </g>
              <g className="animate-steam" style={{ animationDelay: '0.5s' }}>
                <circle cx="65" cy="20" r="3" className="fill-stone-300 opacity-50" />
              </g>

              {/* Back Pot Handle */}
              <path d="M20 45 L10 45 A 5 5 0 0 0 10 55 L20 55" className="fill-sage-600" />
              <path d="M80 45 L90 45 A 5 5 0 0 0 90 55 L80 55" className="fill-sage-600" />

              {/* Pot Body */}
              <path 
                d="M20 40 L80 40 L75 80 A 15 10 0 0 1 25 80 Z" 
                className="fill-sage-400 stroke-sage-600 stroke-2" 
              />
              
              {/* Pot Rim Highlight */}
              <ellipse cx="50" cy="40" rx="30" ry="6" className="fill-sage-300" />

              {/* Spoon - Animated Stirring */}
              <g className="animate-stir origin-[50px_40px]">
                {/* Spoon Handle */}
                <rect x="48" y="10" width="4" height="40" rx="2" className="fill-stone-700" />
                {/* Spoon Head */}
                <ellipse cx="50" cy="50" rx="6" ry="8" className="fill-stone-600" />
              </g>

              {/* Front Pot Lip */}
              <path d="M20 40 A 30 6 0 0 0 80 40" className="fill-none stroke-sage-500 stroke-2" />
              
              {/* Bubbles */}
              <circle cx="40" cy="35" r="2" className="fill-white animate-bubble" style={{ animationDelay: '0.2s' }} />
              <circle cx="60" cy="38" r="1.5" className="fill-white animate-bubble" style={{ animationDelay: '0.8s' }} />
            </g>
          ) : (
            // --- SEARCHING MAGNIFIER ANIMATION ---
            <g className="animate-search origin-center">
               {/* Handle */}
               <path 
                 d="M65 65 L85 85" 
                 strokeWidth="8" 
                 strokeLinecap="round"
                 className="stroke-stone-700" 
               />
               
               {/* Glass Rim */}
               <circle 
                 cx="45" cy="45" r="25" 
                 className="fill-white/50 stroke-sage-500 stroke-[4]"
               />
               
               {/* Glass Reflection */}
               <path 
                 d="M35 35 A 10 10 0 0 1 55 35" 
                 className="fill-none stroke-white stroke-2 opacity-60"
               />

               {/* Eye inside (Fun touch) */}
               <circle cx="45" cy="45" r="4" className="fill-stone-800 animate-pulse" />
            </g>
          )}
          
        </svg>
      </div>
      
      {/* Cycling Messages */}
      <div className="h-12 mt-2 flex items-center justify-center w-full overflow-hidden relative px-4">
        <p 
          key={fadeKey} // Re-trigger animation on change
          className={`font-hand font-bold text-xl text-center whitespace-nowrap animate-fade-in-up ${lightMode ? 'text-white' : 'text-sage-600'}`}
        >
          {messages[currentMsgIndex]}
        </p>
      </div>
    </div>
  );
};

export default LoadingPot;