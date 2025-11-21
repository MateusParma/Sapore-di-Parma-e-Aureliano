import React, { useEffect, useRef, useState } from 'react';

type BeeState = 'WANDERING' | 'FOLLOWING' | 'COOLDOWN';

interface Bee {
  id: number;
  x: number;
  y: number;
  angle: number;
  
  // Movement logic
  targetX: number;
  targetY: number;
  
  // Behavior logic
  state: BeeState;
  stateStartTime: number;
}

const BeeBackground = () => {
  const [bees, setBees] = useState<Bee[]>([
    { id: 1, x: 100, y: 100, angle: 0, targetX: Math.random() * window.innerWidth, targetY: Math.random() * window.innerHeight, state: 'WANDERING', stateStartTime: Date.now() },
    { id: 2, x: window.innerWidth - 100, y: 200, angle: 0, targetX: Math.random() * window.innerWidth, targetY: Math.random() * window.innerHeight, state: 'WANDERING', stateStartTime: Date.now() },
    { id: 3, x: window.innerWidth / 2, y: window.innerHeight - 100, angle: 0, targetX: Math.random() * window.innerWidth, targetY: Math.random() * window.innerHeight, state: 'WANDERING', stateStartTime: Date.now() },
  ]);
  
  const mousePos = useRef({ x: -1000, y: -1000 }); // Start off-screen

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    // Configuration
    const SPEED = 0.008; // Very slow movement
    const ROTATION_SPEED = 0.05;
    const PROXIMITY_THRESHOLD = 200; // Pixel distance to trigger following
    const FOLLOW_DURATION = 2000; // 2 seconds
    const COOLDOWN_DURATION = 3000; // Time before it can follow again

    const animate = () => {
      const now = Date.now();

      setBees(prevBees => prevBees.map(bee => {
        let { x, y, angle, targetX, targetY, state, stateStartTime } = bee;

        // --- 1. STATE MACHINE ---
        
        // Calculate distance to mouse
        const distToMouse = Math.hypot(mousePos.current.x - x, mousePos.current.y - y);

        if (state === 'WANDERING') {
          // Check if we reached the random target
          const distToTarget = Math.hypot(targetX - x, targetY - y);
          if (distToTarget < 20) {
            // Pick new random target
            targetX = Math.random() * window.innerWidth;
            targetY = Math.random() * window.innerHeight;
          }

          // TRIGGER: Check if mouse is close enough to follow
          if (distToMouse < PROXIMITY_THRESHOLD) {
            state = 'FOLLOWING';
            stateStartTime = now;
          }
        } 
        else if (state === 'FOLLOWING') {
          // Set target to mouse position
          targetX = mousePos.current.x;
          targetY = mousePos.current.y;

          // Check duration
          if (now - stateStartTime > FOLLOW_DURATION) {
            state = 'COOLDOWN';
            stateStartTime = now;
            // Pick a random exit target
            targetX = Math.random() * window.innerWidth;
            targetY = Math.random() * window.innerHeight;
          }
        } 
        else if (state === 'COOLDOWN') {
           // Just wander
           const distToTarget = Math.hypot(targetX - x, targetY - y);
           if (distToTarget < 20) {
             targetX = Math.random() * window.innerWidth;
             targetY = Math.random() * window.innerHeight;
           }

           // Check cooldown over
           if (now - stateStartTime > COOLDOWN_DURATION) {
             state = 'WANDERING';
             stateStartTime = now;
           }
        }

        // --- 2. PHYSICS (Movement) ---

        // Lerp position (Smooth movement)
        const dx = targetX - x;
        const dy = targetY - y;
        x += dx * SPEED;
        y += dy * SPEED;

        // Calculate target angle (in degrees)
        // SVG points "UP" (-90deg) by default? No, let's assume SVG points RIGHT (0deg).
        // We need to rotate +90 if the drawing is vertical.
        let targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        // Smooth rotation
        // Basic lerp for angle (handles wrapping simplisticly for this use case)
        const angleDiff = targetAngle - angle;
        // Normalizing angle to avoid 350 -> 10 spin issues would be better, but kept simple for bees
        angle += angleDiff * ROTATION_SPEED;

        return {
          ...bee,
          x,
          y,
          targetX,
          targetY,
          angle,
          state,
          stateStartTime
        };
      }));

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bees.map(bee => (
        <div
          key={bee.id}
          className="absolute w-12 h-12 transition-transform will-change-transform"
          style={{
            transform: `translate(${bee.x}px, ${bee.y}px) rotate(${bee.angle}deg)`,
            transition: 'transform 0s', // Handle via JS loop
          }}
        >
          {/* Better Bee SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm opacity-90 overflow-visible">
             
             {/* Wings (Animated - Distinct and Bigger) */}
             <g className="animate-flap origin-[50px_40px]">
                {/* Left Wing */}
                <path 
                  d="M 50 40 Q 10 20 20 60 Q 40 70 50 40" 
                  className="fill-sky-100/80 stroke-sky-200 stroke-1" 
                  transform="translate(-20, 0)"
                />
                {/* Right Wing */}
                <path 
                  d="M 50 40 Q 90 20 80 60 Q 60 70 50 40" 
                  className="fill-sky-100/80 stroke-sky-200 stroke-1" 
                  transform="translate(20, 0)"
                />
             </g>
             
             {/* Body Group */}
             <g>
               {/* Stinger */}
               <path d="M50 85 L55 95 L45 95 Z" className="fill-stone-800" />
               
               {/* Main Body */}
               <ellipse cx="50" cy="50" rx="22" ry="32" className="fill-yellow-400 stroke-stone-800 stroke-[1.5]" />
               
               {/* Stripes (Curves for 3D effect) */}
               <path d="M30 45 Q 50 55 70 45" className="fill-none stroke-stone-800 stroke-[5] stroke-linecap-round" />
               <path d="M32 62 Q 50 72 68 62" className="fill-none stroke-stone-800 stroke-[5] stroke-linecap-round" />
               
               {/* Face */}
               <circle cx="42" cy="35" r="2.5" className="fill-stone-900" />
               <circle cx="58" cy="35" r="2.5" className="fill-stone-900" />
               
               {/* Antennas */}
               <path d="M40 22 Q 35 10 25 15" className="fill-none stroke-stone-800 stroke-2" />
               <circle cx="25" cy="15" r="1.5" className="fill-stone-800" />
               
               <path d="M60 22 Q 65 10 75 15" className="fill-none stroke-stone-800 stroke-2" />
               <circle cx="75" cy="15" r="1.5" className="fill-stone-800" />
             </g>

          </svg>
        </div>
      ))}
    </div>
  );
};

export default BeeBackground;