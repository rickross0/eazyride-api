import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Smartphone, MapPin, Clock, FileText } from 'lucide-react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';
import confetti from 'canvas-confetti';
import { useInView } from 'react-intersection-observer';
import TermsModal from './TermsModal';

const RELEASE_BASE = 'https://github.com/rickross0/EazyRide-Haye-APKs/releases/download/v3.0.0/';

const particleOptions: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  particles: {
    number: { value: 60 },
    color: { value: ['#ffd700', '#00bcd4', '#cd7f32'] },
    shape: { type: 'star' },
    opacity: { value: { min: 0.2, max: 0.5 }, animation: { enable: true, speed: 0.5 } },
    size: { value: { min: 1, max: 3 } },
    move: { enable: true, speed: 0.8, direction: 'none' as const, random: true, outModes: 'out' as const }
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'repulse' },
      onClick: { enable: true, mode: 'push' }
    },
    modes: { repulse: { distance: 100 }, push: { quantity: 2 } }
  }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

/* ─── Hero ─── */
function Hero() {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-700 to-black relative overflow-hidden">
      {/* Particle field */}
      <Particles id="hero-particles" options={particleOptions} className="absolute inset-0 z-0" />

      {/* Animated Handshake SVG */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, type: 'spring' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 z-10 pointer-events-none select-none"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Outer ring */}
          <motion.circle
            cx="200" cy="200" r="180" fill="none" stroke="#00bcd4" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
          />
          {/* Inner ring */}
          <motion.circle
            cx="200" cy="200" r="150" fill="none" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="8 4"
            initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' as const }}
            style={{ transformOrigin: '200px 200px' }}
          />
          {/* Handshake arm */}
          <motion.path
            d="M100 250 Q150 200 200 220 Q250 200 300 250"
            stroke="#ffd700" strokeWidth="12" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="glow-gold"
          />
          {/* Left horse head (Haye! – copper) */}
          <motion.g
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ transformOrigin: '100px 160px' }}
          >
            <path d="M80 180 Q60 160 80 140 Q100 130 120 140 Q140 160 120 180 Z" fill="#cd7f32" />
          </motion.g>
          {/* Right horse head (EazyRide – gold) */}
          <motion.g
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ transformOrigin: '300px 160px' }}
          >
            <path d="M280 180 Q300 160 280 140 Q260 130 240 140 Q220 160 240 180 Z" fill="#ffd700" />
          </motion.g>
          {/* Somalia / Somaliland shape */}
          <motion.path
            d="M150 220 Q170 240 190 230 Q210 240 230 220 Q210 200 190 210 Q170 200 150 220 Z"
            fill="#ffd700" opacity="0.8"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
            style={{ transformOrigin: '190px 220px' }}
          />
          {/* Map pin for Laascaanood */}
          <motion.circle
            cx="190" cy="215" r="5" fill="#00bcd4"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Unity text */}
          <text x="200" y="340" textAnchor="middle" fill="#ffd700" fontSize="22" fontWeight="bold" fontFamily="Inter, sans-serif">
            UNITY IS POWER
          </text>
          <text x="200" y="370" textAnchor="middle" fill="#ffd700" fontSize="14" fontFamily="Inter, sans-serif" opacity="0.8">
            Powered by Somali
          </text>
        </svg>
      </motion.div>

      {/* Main hero content */}
      <motion.div
        className="relative z-20 flex items-center justify-center min-h-screen px-4 text-white"
        style={{ y: heroY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-cyan to-copper bg-clip-text text-transparent">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">{t('heroSub')}</p>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {[
              { icon: <MapPin className="w-5 h-5" />, label: t('ctaRide'), href: '#downloads' },
              { icon: <Smartphone className="w-5 h-5" />, label: t('ctaFood'), href: '#downloads' },
              { icon: <Clock className="w-5 h-5" />, label: t('ctaCars'), href: '#downloads' }
            ].map((btn, i) => (
              <motion.a
                key={i}
                href={btn.href}
                variants={fadeUp}
                whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(255,215,0,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-gold to-copper px-8 py-4 rounded-2xl font-bold text-navy-900 shadow-2xl"
              >
                {btn.icon} {btn.label}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Services ─── */
function Services() {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  const cards = [
    {
      logo: '/eazyride-logo.svg',
      title: t('services.eazyride'),
      desc: [t('services.desc1'), t('services.desc2')],
      color: 'gold' as const,
      border: 'hover:border-gold/60'
    },
    {
      logo: '/haye-logo.svg',
      title: t('services.haye'),
      desc: [t('services.desc3')],
      color: 'copper' as const,
      border: 'hover:border-copper/60'
    }
  ];

  return (
    <section ref={ref} id="services" className="py-32 px-4 bg-navy-900/50 backdrop-blur-md text-white">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent"
        >
          {t('services.title')}
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className={`bg-navy-700/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-navy-500/50 ${card.border} transition-all cursor-pointer group`}
            >
              <img src={card.logo} alt="" className="w-32 mx-auto mb-8 group-hover:animate-float transition-all" />
              <h3 className={`text-3xl font-bold mb-6 ${card.color === 'gold' ? 'text-gradient-gold' : 'text-gradient-cyan'}`}>
                {card.title}
              </h3>
              <ul className="space-y-4 text-lg">
                {card.desc.map((d, j) => (
                  <li key={j}>• {d}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Downloads ─── */
function Downloads() {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const apks = [
    { name: t('downloads.rider'), file: 'EazyRide-Rider-v3.0.0.apk', size: '37 MB' },
    { name: t('downloads.driver'), file: 'EazyRide-Driver-v3.0.0.apk', size: '37 MB' },
    { name: t('downloads.store'), file: 'EazyRide-StoreOwner-v3.0.0.apk', size: '187 MB' },
    { name: t('downloads.provider'), file: 'EazyRide-Provider-v3.0.0.apk', size: '68 MB' }
  ];

  const handleDownload = useCallback((file: string) => {
    if (!termsAccepted) {
      setShowWarning(true);
      return;
    }
    const link = document.createElement('a');
    link.href = `${RELEASE_BASE}${file}`;
    link.target = '_blank';
    link.click();
    confetti({ angle: 90, spread: 45, particleCount: 80, colors: ['#ffd700', '#00bcd4', '#cd7f32'], origin: { y: 0.7 } });
  }, [termsAccepted]);

  return (
    <section ref={ref} id="downloads" className="py-32 px-4 bg-gradient-to-b from-navy-700 to-navy-900 relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-4xl font-bold text-center mb-10 text-gold"
        >
          {t('downloads.title')}
        </motion.h2>

        {/* Terms & Conditions checkbox */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-10 flex flex-col items-center gap-2"
        >
          <label className="flex items-start gap-3 cursor-pointer group text-white text-base max-w-xl">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked) setShowWarning(false);
              }}
              className="mt-1 w-5 h-5 accent-gold rounded cursor-pointer shrink-0"
            />
            <span>
              {t('terms.agree')}{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-cyan hover:text-gold underline underline-offset-2 font-semibold cursor-pointer"
              >
                <FileText className="inline w-4 h-4 mr-1 -mt-0.5" />
                {t('terms.link')}
              </button>
            </span>
          </label>
          {showWarning && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm font-semibold text-center"
            >
              ⚠️ {t('terms.mustAgree')}
            </motion.p>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apks.map((apk, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleDownload(apk.file)}
              className={`group bg-navy-700/80 p-8 rounded-3xl backdrop-blur-xl shadow-2xl border border-cyan/30 hover:border-gold/50 hover:bg-gold/10 text-white transition-all cursor-pointer relative overflow-hidden ${!termsAccepted ? 'opacity-60' : ''}`}
            >
              <Download className="w-14 h-14 mx-auto mb-4 text-cyan group-hover:text-gold group-hover:rotate-12 transition-all" />
              <h3 className="text-xl font-bold mb-2">{apk.name}</h3>
              <p className="opacity-80 text-sm">{apk.size}</p>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.button>
          ))}
        </div>
        <p className="text-center mt-12 text-lg opacity-75 text-white">Android 10+ | Secure EVC Payments | Made in Somalia 🇸🇴</p>
      </div>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </section>
  );
}

/* ─── Main App ─── */
export default function App() {
  const { i18n } = useTranslation();
  const [isSo, setIsSo] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  useEffect(() => {
    i18n.changeLanguage(isSo ? 'so' : 'en');
  }, [isSo, i18n]);

  return (
    <div className="font-sans antialiased">
      <nav className="fixed top-0 w-full bg-navy-900/95 backdrop-blur-xl z-50 px-4 py-4 border-b border-navy-500/50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.img
            src="/eazyride-logo.svg"
            alt="Logo"
            className="w-14 cursor-pointer"
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.5 }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSo(!isSo)}
            className="bg-gradient-to-r from-gold to-copper px-8 py-3 rounded-2xl font-bold text-navy-900 shadow-xl animate-pulse-glow transition-all cursor-pointer"
          >
            {isSo ? 'English' : 'Soomaali'}
          </motion.button>
        </div>
      </nav>

      {particlesReady && <Hero />}
      <Services />
      <Downloads />

      <footer className="py-16 bg-navy-900 text-center text-gray-400 border-t border-navy-500/50">
        <p>
          &copy; 2026 EazyRide + Haye! | Laascaanood Pride |{' '}
          <a href="mailto:support@eazyride.so" className="text-gold hover:underline">Contact</a>
        </p>
      </footer>
    </div>
  );
}
