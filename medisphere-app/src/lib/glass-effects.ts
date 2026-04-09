/**
 * Glass Morphism Effects Library
 * Provides consistent glassmorphic styling utilities for the entire application
 */

export const glassEffects = {
  // Basic glass effect with blur
  glass: "bg-white/10 backdrop-blur-md border border-white/20",
  
  // Lighter glass effect
  glassLight: "bg-white/20 backdrop-blur-lg border border-white/30",
  
  // Darker glass effect
  glassDark: "bg-black/20 backdrop-blur-xl border border-white/10",
  
  // Frosted glass effect
  glassFrosted: "bg-white/15 backdrop-blur-xl border border-white/25 shadow-xl",
  
  // Deep glass effect with shadow
  glassDeep: "bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl",
  
  // Subtle glass effect
  glassSubtle: "bg-white/5 backdrop-blur-md border border-white/10",
  
  // Premium glass effect (maximum blur and opacity)
  glassPremium: "bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-3xl border border-white/30 shadow-2xl",
};

export const glassCardVariants = {
  default: `${glassEffects.glass} hover:bg-white/20 transition-all duration-300`,
  elevated: `${glassEffects.glassLight} hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300`,
  premium: `${glassEffects.glassPremium} hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300`,
  subtle: `${glassEffects.glassSubtle} hover:bg-white/10 transition-all duration-300`,
};

export const glassButtonVariants = {
  primary: `${glassEffects.glass} text-white hover:bg-white/20 active:bg-white/30`,
  secondary: `${glassEffects.glassSubtle} text-gray-900 hover:bg-white/15 active:bg-white/25`,
  outline: `bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60`,
};

export const glassInputVariants = {
  default: `${glassEffects.glass} text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40`,
  elevated: `${glassEffects.glassLight} text-gray-900 placeholder:text-gray-500 focus:bg-white/30 focus:border-white/60`,
};
