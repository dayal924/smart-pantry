import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-white/90 dark:bg-[#0E1A11]/90 hover:bg-pantry-600 dark:hover:bg-pantry-600 text-pantry-700 dark:text-hud-green hover:text-white dark:hover:text-white border border-slate-300 dark:border-emerald-500/40 shadow-xl shadow-slate-400/30 dark:shadow-black/50 transition-all duration-300 hover:scale-110 backdrop-blur-md group"
      aria-label="Scroll back to top"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
