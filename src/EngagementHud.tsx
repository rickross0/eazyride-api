import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

interface BadgesProps {
  scrollProgress: number;
}

const badges = [
  { milestone: 25, name: 'Scout', icon: '🛤️', desc: 'Explorer' },
  { milestone: 50, name: 'Rider', icon: '🚗', desc: 'First Ride' },
  { milestone: 75, name: 'Driver', icon: '🚕', desc: 'Road Warrior' },
  { milestone: 100, name: 'Unity Hero', icon: '⭐', desc: 'Somali Pride' }
];

export function Badges({ scrollProgress }: BadgesProps) {
  const [unlocked, setUnlocked] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eazyride-badges') || '[]');
    } catch { return []; }
  });
  const [lastUnlocked, setLastUnlocked] = useState<string | null>(null);

  useEffect(() => {
    const pct = Math.round(scrollProgress * 100);
    const newBadges = badges.filter(b => pct >= b.milestone).map(b => b.name);
    const newlyUnlocked = newBadges.filter(b => !unlocked.includes(b));
    
    if (newlyUnlocked.length > 0) {
      setUnlocked(prev => {
        const next = [...new Set([...prev, ...newBadges])];
        localStorage.setItem('eazyride-badges', JSON.stringify(next));
        return next;
      });
      setLastUnlocked(newlyUnlocked[newlyUnlocked.length - 1]);
      const timer = setTimeout(() => setLastUnlocked(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [scrollProgress]);

  return (
    <>
      <div className="fixed top-28 left-4 space-y-2 z-30">
        {badges.map((b, i) => {
          const isUnlocked = unlocked.includes(b.name);
          return (
            <motion.div
              key={b.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isUnlocked ? 1 : 0.7, opacity: isUnlocked ? 1 : 0.4 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${isUnlocked ? 'bg-gold text-navy-900 border-gold shadow-lg glow-gold' : 'bg-navy-800 text-gray-500 border-navy-600'}`}
            >
              <span>{b.icon}</span>
              <span>{b.name}</span>
            </motion.div>
          );
        })}
      </div>
      
      <AnimatePresence>
        {lastUnlocked && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLastUnlocked(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -50 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-gold text-navy-900 px-10 py-8 rounded-3xl shadow-2xl border-4 border-white/20 text-center min-w-[280px]"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setLastUnlocked(null); }}
                className="absolute -top-3 -right-3 w-10 h-10 bg-navy-900 text-gold rounded-full flex items-center justify-center text-xl font-bold cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-gold"
              >
                ×
              </button>
              <p className="text-5xl mb-3">{badges.find(b => b.name === lastUnlocked)?.icon}</p>
              <p className="text-2xl font-bold mb-1">Badge Unlocked! 🎉</p>
              <p className="text-xl font-bold text-navy-700">{lastUnlocked}</p>
              <button
                onClick={() => setLastUnlocked(null)}
                className="mt-4 px-6 py-2 bg-navy-900 text-gold rounded-xl font-bold text-sm hover:bg-navy-700 transition-colors cursor-pointer"
              >
                Awesome!
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const testimonials = [
  { name: 'Fadumo', quote: '"Best rides in Laascaanood! Fast, safe, and affordable."', role: 'Rider' },
  { name: 'Abdullahi', quote: '"Driving with EazyRide changed my life. Daily income, zero hassle."', role: 'Driver' },
  { name: 'Amina', quote: '"Haye! Food delivery is amazing. My restaurant sales doubled!"', role: 'Store Owner' },
  { name: 'Hassan', quote: '"The car rental service is top-notch. Clean cars, fair prices."', role: 'Provider' },
  { name: 'Halimo', quote: '"Unity is power! EazyRide connects all of Somalia. 🇸🇴"', role: 'Rider' },
  { name: 'Mohamed', quote: '"EVC payments make everything smooth. No cash, no problem."', role: 'Driver' },
  { name: 'Sahra', quote: '"I love the Somali-language support. Feels like home."', role: 'Rider' },
  { name: 'Ismail', quote: '"Laascaanood to Hargeisa — EazyRide got me there safely."', role: 'Rider' }
];

export function InfiniteTestimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-navy-900 to-black overflow-hidden">
      <h3 className="text-3xl font-bold text-center text-gold mb-12 glow-gold">⭐ What Somalis Say</h3>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
        className="max-w-6xl mx-auto px-4"
      >
        {testimonials.map((t, i) => (
          <SwiperSlide key={i}>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-navy-800/80 backdrop-blur-xl p-8 rounded-3xl border border-gold/30 shadow-xl h-full"
            >
              <p className="text-lg text-white mb-4 italic">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gold to-cyan flex items-center justify-center text-navy-900 font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-gold font-bold text-sm">{t.name}</p>
                  <p className="text-cyan text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
