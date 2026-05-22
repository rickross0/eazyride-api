import { useEffect, useRef } from 'react';

interface VoiceNarratorProps {
  lang: string;
  trigger?: boolean;
}

export default function VoiceNarrator({ lang, trigger = true }: VoiceNarratorProps) {
  const hasSpoken = useRef(false);

  useEffect(() => {
    if (!trigger || hasSpoken.current || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Small delay to avoid overlapping with page load sounds
    const timer = setTimeout(() => {
      const text = lang === 'so' 
        ? 'Midnimadu waa awood! EazyRide iyo Haye! Somaliya wada mid.' 
        : lang === 'ar'
        ? 'الوحدة قوة! إيزي رايد وهاي! بقوة الصومال.'
        : 'Unity is Power! EazyRide plus Haye! Powered by Somali.';
      
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = lang === 'so' ? 'so-SO' : lang === 'ar' ? 'ar-SA' : 'en-US';
      msg.rate = 0.9;
      msg.pitch = 1.1;
      msg.volume = 0.8;
      
      window.speechSynthesis.speak(msg);
      hasSpoken.current = true;
    }, 2000);

    return () => clearTimeout(timer);
  }, [lang, trigger]);

  return null;
}
