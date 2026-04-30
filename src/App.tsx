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
      <Particles id="hero-particles" options={particleOptions} className="absolute inset-0 z-0" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, type: 'spring' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 z-10 pointer-events-none select-none"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <motion.circle
            cx="200" cy="200" r="180" fill="none" stroke="#00bcd4" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
          />
          <motion.circle
            cx="200" cy="200" r="150" fill="none" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="8 4"
            initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' as const }}
            style={{ transformOrigin: '200px 200px' }}
          />
          <motion.path
            d="M100 250 Q150 200 200 220 Q250 200 300 250"
            stroke="#ffd700" strokeWidth="12" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="glow-gold"
          />
          <motion.g
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ transformOrigin: '100px 160px' }}
          >
            <path d="M80 180 Q60 160 80 140 Q100 130 120 140 Q140 160 120 180 Z" fill="#cd7f32" />
          </motion.g>
          <motion.g
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ transformOrigin: '300px 160px' }}
          >
            <path d="M280 180 Q300 160 280 140 Q260 130 240 140 Q220 160 240 180 Z" fill="#ffd700" />
          </motion.g>
          {/* Cloud-white horse accent */}
          <motion.g
            animate={{ rotate: [3, -3, 3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ transformOrigin: '260px 130px' }}
          >
            <path d="M240 145 Q255 115 270 130 Q280 145 265 155 Z" fill="rgba(255,255,255,0.6)" />
          </motion.g>
          <motion.path
            d="M150 220 Q170 240 190 230 Q210 240 230 220 Q210 200 190 210 Q170 200 150 220 Z"
            fill="#ffd700" opacity="0.8"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
            style={{ transformOrigin: '190px 220px' }}
          />
          <motion.circle
            cx="190" cy="215" r="5" fill="#00bcd4"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <text x="200" y="340" textAnchor="middle" fill="#ffd700" fontSize="22" fontWeight="bold" fontFamily="Inter, sans-serif">
            UNITY IS POWER
          </text>
          <text x="200" y="370" textAnchor="middle" fill="#ffd700" fontSize="14" fontFamily="Inter, sans-serif" opacity="0.8">
            Powered by Somali
          </text>
        </svg>
      </motion.div>

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
          {/* Cloud EazyRide Logo */}
          <motion.img
            src="/eazyride-cloud.png"
            alt="EazyRide Cloud"
            className="w-24 md:w-32 mx-auto mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            whileHover={{ scale: 1.15, rotate: 5 }}
          />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-cyan to-copper bg-clip-text text-transparent">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90">{t('heroSub')}</p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.a href="#downloads" variants={fadeUp}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-gold to-copper px-10 py-5 rounded-2xl text-navy-900 font-bold text-lg shadow-2xl glow-gold transition-all cursor-pointer"
              >
                <MapPin className="inline w-5 h-5 mr-2 -mt-1" />{t('ctaRide')}
              </motion.button>
            </motion.a>
            <motion.a href="#downloads" variants={fadeUp}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-cyan to-gold px-10 py-5 rounded-2xl text-navy-900 font-bold text-lg shadow-2xl glow-cyan transition-all cursor-pointer"
              >
                <Smartphone className="inline w-5 h-5 mr-2 -mt-1" />{t('ctaFood')}
              </motion.button>
            </motion.a>
            <motion.a href="#downloads" variants={fadeUp}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-copper to-gold px-10 py-5 rounded-2xl text-navy-900 font-bold text-lg shadow-2xl glow-copper transition-all cursor-pointer"
              >
                <Clock className="inline w-5 h-5 mr-2 -mt-1" />{t('ctaCars')}
              </motion.button>
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-gold text-4xl"
      >
        ↓
      </motion.div>
    </section>
  );
}

/* ─── Services ─── */
function Services() {
  const { t } = useTranslation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} id="services" className="py-32 px-4 bg-gradient-to-b from-black to-navy-900 text-white relative">
      <Particles options={particleOptions} className="absolute inset-0 z-0 opacity-30" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          className="text-4xl md:text-5xl font-bold text-center mb-20 text-gold glow-gold"
        >
          {t('services.title')}
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.03, y: -8 }}
            className="bg-navy-700/60 backdrop-blur-xl p-10 rounded-3xl border border-cyan/30 hover:border-cyan/60 shadow-2xl group"
          >
            <motion.img
              src="/eazyride-cloud.png"
              alt="EazyRide Cloud"
              className="w-20 mx-auto mb-6 group-hover:animate-pulse"
              whileHover={{ scale: 1.15, rotate: 5 }}
            />
            <h3 className="text-3xl font-bold mb-6 text-cyan">{t('services.eazyride')}</h3>
            <ul className="space-y-3 text-lg opacity-90">
              <motion.li whileHover={{ x: 10 }} className="flex items-start">
                <span className="w-2 h-2 bg-cyan rounded-full mt-2 mr-3 flex-shrink-0" />{t('services.desc1')}
              </motion.li>
              <motion.li whileHover={{ x: 10 }} className="flex items-start">
                <span className="w-2 h-2 bg-cyan rounded-full mt-2 mr-3 flex-shrink-0" />{t('services.desc2')}
              </motion.li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.03, y: -8 }}
            className="bg-navy-700/60 backdrop-blur-xl p-10 rounded-3xl border border-gold/30 hover:border-gold/60 shadow-2xl group"
          >
            <img
              src="/haye-green.png"
              alt="Haye!"
              className="w-32 mx-auto mb-8 filter brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-500"
            />
            <h3 className="text-3xl font-bold mb-6 text-gold">{t('services.haye')}</h3>
            <ul className="space-y-3 text-lg opacity-90">
              <motion.li whileHover={{ x: 10 }} className="flex items-start">
                <span className="w-2 h-2 bg-gold rounded-full mt-2 mr-3 flex-shrink-0" />{t('services.desc3')}
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Benefits (v5) ─── */
function Benefits() {
  const { t } = useTranslation();
  const roles = ['rider', 'driver', 'store', 'provider'];
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  const tableRows = [
    { app: t('benefits.table.riderApp'), who: t('benefits.table.riderWho'), benefit: t('benefits.table.riderBenefit') },
    { app: t('benefits.table.driverApp'), who: t('benefits.table.driverWho'), benefit: t('benefits.table.driverBenefit') },
    { app: t('benefits.table.storeApp'), who: t('benefits.table.storeWho'), benefit: t('benefits.table.storeBenefit') },
    { app: t('benefits.table.providerApp'), who: t('benefits.table.providerWho'), benefit: t('benefits.table.providerBenefit') }
  ];

  return (
    <section ref={ref} id="benefits" className="py-32 px-4 bg-gradient-to-b from-black to-navy-900 text-white overflow-hidden relative">
      <Particles options={particleOptions} className="absolute inset-0 z-0 opacity-50" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent glow-cyan"
        >
          {t('benefits.title')}
        </motion.h2>

        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {roles.map((role, i) => {
            const benefitsList = t(`benefits.${role}.benefits`, { returnObjects: true });
            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.02, y: -10 }}
                className="bg-navy-700/70 backdrop-blur-xl p-10 rounded-3xl border border-gold/30 hover:border-cyan/50 shadow-2xl group cursor-pointer"
              >
                <h3 className="text-3xl font-bold mb-4 text-gold">{t(`benefits.${role}.who`)}</h3>
                <p className="text-xl mb-6 opacity-90 italic">{t(`benefits.${role}.for`)}</p>
                <ul className="space-y-3 text-lg">
                  {Array.isArray(benefitsList) && benefitsList.map((benefit: any, j: number) => (
                    <motion.li key={j} whileHover={{ x: 10 }} className="flex items-start group-hover:text-cyan transition-colors">
                      <span className="w-2 h-2 bg-cyan rounded-full mt-2 mr-4 flex-shrink-0" /> {benefit}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="overflow-x-auto"
        >
          <table className="w-full text-left bg-navy-800/50 backdrop-blur-xl rounded-2xl border border-navy-500/50">
            <thead>
              <tr className="border-b border-gold/30">
                <th className="p-4 text-gold font-bold">{t('benefits.table.app')}</th>
                <th className="p-4 text-gold font-bold">{t('benefits.table.who')}</th>
                <th className="p-4 text-gold font-bold">{t('benefits.table.mainBenefit')}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <motion.tr
                  key={i}
                  whileHover={{ backgroundColor: 'rgba(255,215,0,0.1)' }}
                  className="hover:glow-gold transition-all border-b border-navy-500/30 last:border-0"
                >
                  <td className="p-4 font-semibold">{row.app}</td>
                  <td className="p-4">{row.who}</td>
                  <td className="p-4">{row.benefit}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
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
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState('en');
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  // RTL support: switch dir when language changes
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return (
    <div className="font-sans antialiased">
      <nav className="fixed top-0 w-full bg-navy-900/95 backdrop-blur-xl z-50 px-4 py-4 border-b border-navy-500/50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.img
            src="/eazyride-cloud.png"
            alt="EazyRide Cloud"
            className="w-16 cursor-pointer"
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ duration: 0.5 }}
          />
          {/* Language selector: 3 buttons (EN/SO/AR) */}
          <motion.div className="flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${lang === 'en' ? 'bg-gold text-navy-900' : 'bg-navy-700 text-white hover:bg-navy-500'}`}
            >
              {t('switchEn')}
            </button>
            <button
              onClick={() => setLang('so')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${lang === 'so' ? 'bg-gold text-navy-900' : 'bg-navy-700 text-white hover:bg-navy-500'}`}
            >
              {t('switchSo')}
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${lang === 'ar' ? 'bg-gold text-navy-900' : 'bg-navy-700 text-white hover:bg-navy-500'}`}
            >
              {t('switchAr')}
            </button>
          </motion.div>
        </div>
      </nav>

      {particlesReady && <Hero />}
      <Services />
      <Benefits />
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
