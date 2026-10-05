import React from 'react';

interface QuizFlowerProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const QuizFlowerProgress: React.FC<QuizFlowerProgressProps> = ({
  currentStep,
  totalSteps = 8,
}) => {
  const progressRatio = Math.min(1, Math.max(0, currentStep / totalSteps));
  const progressPercent = Math.round(progressRatio * 100);

  // Blooming factor from 0.2 (closed bud) to 1.0 (full open lotus)
  const bloom = 0.2 + progressRatio * 0.8;

  return (
    <div className="w-full flex flex-col items-center mb-6">
      {/* Blooming Lotus SVG */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transition-all duration-500 ease-out"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle glow halo */}
          <circle
            cx="50"
            cy="52"
            r={24 + progressRatio * 20}
            fill="#D4AF37"
            fillOpacity={0.06 + progressRatio * 0.12}
            className="transition-all duration-500"
          />

          {/* Central Stem & Base Leaves */}
          <path
            d="M50 78 C42 84, 25 82, 20 74 C34 72, 45 74, 50 78 Z"
            fill="#1C2E24"
            opacity={0.7}
          />
          <path
            d="M50 78 C58 84, 75 82, 80 74 C66 72, 55 74, 50 78 Z"
            fill="#1C2E24"
            opacity={0.7}
          />

          {/* Outer Lateral Petals (Spreading wider as bloom increases) */}
          <path
            d={`M50 45 C${50 + 38 * bloom} ${55 - 10 * bloom}, ${50 + 44 * bloom} ${75}, 50 75 C${50 + 20 * bloom} 65, 50 55, 50 45 Z`}
            fill="#E5C76B"
            opacity={0.5 + progressRatio * 0.45}
            className="transition-all duration-500"
          />
          <path
            d={`M50 45 C${50 - 38 * bloom} ${55 - 10 * bloom}, ${50 - 44 * bloom} ${75}, 50 75 C${50 - 20 * bloom} 65, 50 55, 50 45 Z`}
            fill="#E5C76B"
            opacity={0.5 + progressRatio * 0.45}
            className="transition-all duration-500"
          />

          {/* Mid Tier Petals */}
          <path
            d={`M50 30 C${50 + 24 * bloom} 42, ${50 + 26 * bloom} 68, 50 72 C${50 + 10 * bloom} 60, 50 45, 50 30 Z`}
            fill="#D4AF37"
            opacity={0.75 + progressRatio * 0.25}
            className="transition-all duration-500"
          />
          <path
            d={`M50 30 C${50 - 24 * bloom} 42, ${50 - 26 * bloom} 68, 50 72 C${50 - 10 * bloom} 60, 50 45, 50 30 Z`}
            fill="#D4AF37"
            opacity={0.75 + progressRatio * 0.25}
            className="transition-all duration-500"
          />

          {/* Center Bud / Main Flower Heart */}
          <path
            d={`M50 ${24 - progressRatio * 8} C58 38, 58 64, 50 74 C42 64, 42 38, 50 ${24 - progressRatio * 8} Z`}
            fill="#D4AF37"
            className="transition-all duration-500"
          />

          {/* Golden Pistil Sparkle when bloomed */}
          {currentStep >= 5 && (
            <circle
              cx="50"
              cy="48"
              r="2.5"
              fill="#FFF8E7"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Step Indicator Text */}
      <div className="flex items-center justify-between w-full max-w-md text-xs text-[#8C6D46] font-medium mb-1.5 px-1">
        <span className="font-serif text-sm text-[#1C2E24]">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="text-[11px] tracking-wider uppercase font-semibold text-[#8C6D46]">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Track Bar */}
      <div className="w-full max-w-md h-2 bg-[#EBE3D8] rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#1C2E24] rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
