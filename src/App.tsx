import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Smartphone, MapPin, Clock, FileText, HelpCircle, X } from 'lucide-react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';
import confetti from 'canvas-confetti';
import { useInView } from 'react-intersection-observer';
import TermsModal from './TermsModal';
import gsap from './gsap-utils';

const RELEASE_BASE = 'https://github.com/rickross0/EazyRide-Haye-APKs/releases/download/v3.0.0/';

const particleOptions: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  particles: {
    number: { value: 80 },
    color: { value: ['#ffd700', '#00bcd4', '#cd7f32'] },
    shape: { type: 'star' },
    opacity: { value: { min: 0.2, max: 0.6 }, animation: { enable: true, speed: 0.5 } },
    size: { value: { min: 1, max: 4 } },
    move: {
      enable: true,
      speed: 1.2,
      direction: 'none' as const,
      random: true,
      outModes: 'out' as const,
      attract: { enable: true }
    }
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'repulse' },
      onClick: { enable: true, mode: 'push' }
    },
    modes: { repulse: { distance: 120 }, push: { quantity: 3 } }
  }
};

const starfieldOptions: ISourceOptions = {
  fpsLimit: 60,
  particles: {
    number: { value: 200 },
    color: { value: ['#ffd700', '#00bcd4', '#cd7f32', '#9932cc'] },
    shape: { type: ['star', 'circle', 'polygon'] as any },
    opacity: { value: 0.4, animation: { enable: true, speed: 1 } },
    size: { value: { min: 1, max: 4 }, animation: { enable: true } },
    move: {
      enable: true,
      speed: { min: 0.1, max: 0.5 },
      direction: 'none' as const,
      random: true,
      straight: false,
      outModes: 'out' as const,
      attract: { enable: true }
    }
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: ['repulse', 'bubble'] as any },
      onClick: { enable: true, mode: 'push' as any }
    },
    modes: {
      repulse: { distance: 100, duration: 0.4 },
      bubble: { size: 10, opacity: 0.8 }
    }
  },
  detectRetina: true,
  background: { color: { value: 'transparent' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const staggerItem = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

/* ─── Mouse Trail ─── */
function MouseTrail() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const update = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', update);
    return () => window.removeEventListener('mousemove', update);
  }, []);
  return (
    <motion.div
      className="fixed pointer-events-none z-[999] w-4 h-4 bg-gradient-to-r from-gold to-cyan rounded-full mix-blend-difference opacity-75"
      animate={{ x: pos.x - 8, y: pos.y - 8, scale: [1, 1.5, 1] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' as const }}
    />
  );
}

/* ─── Scroll Progress Bar ─── */
function ProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      setProgress(Math.min(1, Math.max(0, scrolled)));
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div className="fixed bottom-6 left-6 right-6 bg-navy-900/80 backdrop-blur-xl rounded-full h-2 z-40 overflow-hidden">
      <motion.div className="h-full bg-gradient-to-r from-gold to-cyan glow-gold"
        animate={{ width: `${progress * 100}%` }} transition={{ ease: 'easeOut' }} />
    </div>
  );
}

/* ─── Unity Meter ─── */
function UnityMeter() {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      setFill(Math.min(100, Math.round(scrolled * 100)));
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div className="fixed top-20 right-6 z-40 text-center">
      <div className="bg-navy-900/80 backdrop-blur-xl rounded-2xl p-3 border border-gold/30">
        <p className="text-gold text-xs font-bold mb-1">Unity</p>
        <div className="w-3 h-24 bg-navy-700 rounded-full overflow-hidden relative">
          <motion.div className="absolute bottom-0 w-full bg-gradient-to-t from-gold to-cyan"
            animate={{ height: `${fill}%` }} transition={{ ease: 'easeOut' }} />
        </div>
        <p className="text-gold text-xs font-bold mt-1">{fill}%</p>
      </div>
    </div>
  );
}

/* ─── Ticker ─── */
function Ticker() {
  const [users, setUsers] = useState(9847);
  const { i18n } = useTranslation();
  useEffect(() => {
    const id = setInterval(() => setUsers(u => u + Math.floor(Math.random() * 3)), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gold text-navy-900 px-6 py-2 rounded-full font-bold z-30 text-sm shadow-xl animate-ticker">
      ⭐ {users.toLocaleString()} {i18n.language === 'ar' ? 'راكب ومتزايد!' : i18n.language === 'so' ? 'Rider oo koraya!' : 'Riders & Growing!'}
    </div>
  );
}

/* ─── Quiz ─── */
function Quiz({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    { q: lang === 'ar' ? 'هل تحتاج رحلة سريعة؟' : lang === 'so' ? 'Ma u baahantahay raac degdeg ah?' : 'Need a quick ride?', a: 'rider' },
    { q: lang === 'ar' ? 'هل تريد كسب المال بالقيادة؟' : lang === 'so' ? 'Ma rabtaa inaad kastumo ka dhigto baabuur wadida?' : 'Want to earn by driving?', a: 'driver' },
    { q: lang === 'ar' ? 'هل لديك مطعم تريد توسيعه؟' : lang === 'so' ? 'Ma leedahay maqaayad aad u ballaariso?' : 'Have a restaurant to expand?', a: 'store' },
    { q: lang === 'ar' ? 'هل تدير أسطول سيارات؟' : lang === 'so' ? 'Ma maareynaysaa flit gaadiid ah?' : 'Manage a car fleet?', a: 'provider' }
  ];

  const resultApp = score >= 3 ? 'rider' : score >= 2 ? 'driver' : score >= 1 ? 'store' : 'provider';
  const resultName = t(`downloads.${resultApp === 'store' ? 'store' : resultApp}`);
  const isDone = step >= questions.length;

  const handleAnswer = (choice: string) => {
    if (questions[step]?.a === choice) setScore(s => s + 1);
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      confetti({ angle: 90, spread: 55, particleCount: 120, colors: ['#ffd700', '#00bcd4'], shapes: ['star' as any], origin: { y: 0.6 } });
    }
  };

  return (
    <>
      <motion.button onClick={() => { setOpen(true); setStep(0); setScore(0); }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 bg-cyan text-white p-4 rounded-full shadow-2xl glow-cyan z-30 cursor-pointer">
        <HelpCircle className="w-6 h-6" />
      </motion.button>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-navy-900 p-10 rounded-3xl max-w-md w-full text-white border border-gold/30 shadow-2xl relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
            <h2 className="text-3xl font-bold mb-8 text-gold">
              {lang === 'ar' ? 'أي تطبيق لك؟' : lang === 'so' ? 'Waa Kee App-kii?' : 'Which App for You?'}
            </h2>
            {!isDone ? (
              <>
                <p className="text-xl mb-6">{questions[step].q}</p>
                <div className="flex gap-4">
                  <button onClick={() => handleAnswer('rider')} className="flex-1 bg-gold text-navy-900 p-4 rounded-xl font-bold cursor-pointer hover:opacity-90 transition-opacity">✅ {lang === 'ar' ? 'نعم' : lang === 'so' ? 'Haa' : 'Yes'}</button>
                  <button onClick={() => handleAnswer('other')} className="flex-1 bg-navy-700 p-4 rounded-xl font-bold cursor-pointer hover:bg-navy-500 transition-colors">❌ {lang === 'ar' ? 'لا' : lang === 'so' ? 'Maya' : 'No'}</button>
                </div>
                <p className="text-center text-sm opacity-60 mt-4">{step + 1} / {questions.length}</p>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-2xl font-bold text-center mb-6">{lang === 'ar' ? 'التطبيق المثالي لك:' : lang === 'so' ? 'App-ka kugu habboon:' : 'Your perfect app:'}</p>
                <p className="text-3xl font-bold text-gold text-center mb-8">🚀 {resultName}</p>
                <a href="#downloads">
                  <button onClick={() => setOpen(false)} className="w-full bg-gradient-to-r from-gold to-cyan text-navy-900 p-4 rounded-xl font-bold cursor-pointer hover:opacity-90 transition-opacity">
                    <Download className="inline w-5 h-5 mr-2" />{lang === 'ar' ? 'حمل الآن' : lang === 'so' ? 'Soo Degso Hadda' : 'Download Now'}
                  </button>
                </a>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* ─── Newsletter Popup ─── */
function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { i18n } = useTranslation();
  const lang = i18n.language;

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (e.clientY <= 10 && !sessionStorage.getItem('newsletter_shown')) {
        setShow(true);
        sessionStorage.setItem('newsletter_shown', '1');
      }
    };
    document.addEventListener('mouseleave', handleMouse);
    return () => document.removeEventListener('mouseleave', handleMouse);
  }, []);

  const handleSubmit = () => {
    if (email) {
      setSubmitted(true);
      confetti({ angle: 90, spread: 45, particleCount: 60, colors: ['#ffd700', '#00bcd4'], origin: { y: 0.7 } });
    }
  };

  return (
    <>
      {show && (
        <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShow(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-navy-800 border border-gold/30 rounded-3xl max-w-md w-full p-8 shadow-2xl text-white relative">
            <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-gold mb-4">{lang === 'ar' ? '🚀 انضم لثورة النقل!' : lang === 'so' ? '🚀 Ku biir kacaanka gaadiidka!' : '🚀 Join the Ride Revolution!'}</h2>
            {!submitted ? (
              <>
                <p className="text-white/80 mb-6">{lang === 'ar' ? 'احصل على آخر الأخبار والعروض.' : lang === 'so' ? 'Hel wararka ugu dambeeya iyo dalabyada.' : 'Get the latest news & deals.'}</p>
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
                    className="flex-1 bg-navy-700 border border-navy-500 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-gold outline-none" />
                  <button onClick={handleSubmit} className="bg-gradient-to-r from-gold to-cyan text-navy-900 font-bold px-6 py-3 rounded-xl cursor-pointer hover:opacity-90 transition-opacity">{lang === 'ar' ? 'إرسال' : lang === 'so' ? 'Dir' : 'Go'}</button>
                </div>
              </>
            ) : (
              <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-gold text-xl font-bold text-center">{lang === 'ar' ? '🎉 شكراً! سنتواصل قريباً.' : lang === 'so' ? '🎉 Mahadsanid! Waan kula xiriiri doonaa.' : '🎉 Thanks! We\'ll be in touch.'}</motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* ─── Epic Hero SVG (Pure Framer Motion — No GSAP Conflicts) ─── */
function HeroSVG({ lang }: { lang: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const handshakeRef = useRef<SVGPathElement>(null);
  const mapRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGCircleElement>(null);

  // GSAP timeline starts AFTER Framer Motion entrance animations finish (~3s)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!handshakeRef.current || !mapRef.current || !pinRef.current) return;

      // Handshake arm shakes: animate SVG path d attribute
      const armTl = gsap.timeline({ repeat: -1, yoyo: true });
      armTl.to(handshakeRef.current, {
        attr: { d: "M160 255 Q200 230 240 255" },
        duration: 0.8,
        ease: "power2.inOut",
      }).to(handshakeRef.current, {
        attr: { d: "M160 245 Q200 250 240 245" },
        duration: 0.8,
        ease: "power2.inOut",
      });

      // Somalia map pulses scale + glow
      const mapTl = gsap.timeline({ repeat: -1, yoyo: true });
      mapTl.to(mapRef.current, {
        scale: 1.3,
        duration: 1,
        ease: "power2.out",
        transformOrigin: "220px 280px",
      }).to(mapRef.current, {
        scale: 1,
        duration: 0.8,
        ease: "power2.inOut",
        transformOrigin: "220px 280px",
      });

      // Pin pulses radius
      const pinTl = gsap.timeline({ repeat: -1, yoyo: true });
      pinTl.to(pinRef.current, {
        attr: { r: 9 },
        duration: 0.5,
        ease: "power2.out",
      }).to(pinRef.current, {
        attr: { r: 5 },
        duration: 0.4,
        ease: "power2.in",
      });

      return () => { armTl.kill(); mapTl.kill(); pinTl.kill(); };
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleMapHover = () => {
    confetti({ particleCount: 50, spread: 360, startVelocity: 30, colors: ["#ffd700", "#00bcd4"], origin: { x: 0.5, y: 0.7 } });
  };

  return (
    <motion.div
      initial={{ scale: 0.5, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 2, type: "spring", damping: 10 }}
      whileHover={{ scale: 1.03 }}
      className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] pointer-events-auto select-none"
    >
      <svg ref={svgRef} viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl cursor-grab active:cursor-grabbing">
        <defs>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b8860b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00bcd4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#008ba3" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ornate Brass Frame */}
        <motion.rect width="500" height="500" rx="20" fill="none" stroke="#8b4513" strokeWidth="15" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5 }} />
        <g stroke="#00bcd4" strokeWidth="8" strokeLinecap="round" fill="none">
          <motion.line x1="50" y1="50" x2="450" y2="450" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5 }} />
          <motion.line x1="50" y1="450" x2="450" y2="50" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.7 }} />
        </g>

        {/* Corner Gems */}
        <motion.g animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "250px 250px" }}>
          <circle cx="60" cy="60" r="25" fill="#9932cc" className="glow-cyan" />
          <circle cx="440" cy="60" r="25" fill="#9932cc" className="glow-gold" />
          <circle cx="60" cy="440" r="25" fill="#00bcd4" className="glow-cyan" />
          <circle cx="440" cy="440" r="25" fill="#ffd700" className="glow-gold" />
        </motion.g>

        {/* Cosmic Orbit Rings */}
        <motion.circle cx="250" cy="250" r="180" fill="none" stroke="#00bcd4" strokeWidth="3" strokeDasharray="10 5"
          animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "250px 250px" }} />
        <motion.circle cx="250" cy="250" r="220" fill="none" stroke="#ffd700" strokeWidth="2" opacity="0.6"
          animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "250px 250px" }} />

        {/* Extra Orbit Rings */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.circle key={i} cx="250" cy="250" r={40 + i * 30} fill="none" stroke="#00bcd4" strokeWidth="1" opacity="0.3"
            animate={{ rotate: i % 2 ? 360 : -360 }} transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "250px 250px" }} />
        ))}

        {/* ── Somalia Map: GSAP scale pulse (Framer Motion entrance only) ── */}
        <motion.path
          ref={mapRef}
          d="M180 280 Q200 300 220 290 Q240 300 260 280 Q240 260 220 270 Q200 260 180 280 Z M190 285 L230 285 Q220 295 210 290 Z"
          fill="#ffd700" stroke="#b8860b" strokeWidth="2"
          style={{ transformOrigin: "220px 280px", cursor: "pointer", filter: "drop-shadow(0 0 8px #ffd700)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          whileHover={{ scale: 1.5, filter: "drop-shadow(0 0 30px #ffd700)", transition: { duration: 0.2 } }}
          onHoverStart={handleMapHover}
          onClick={() => alert("Laascaanood — Our Hub! 🚀")}
        />

        {/* ── Laascaanood Pin: GSAP radius pulse (Framer Motion entrance only) ── */}
        <motion.circle
          ref={pinRef}
          cx="205" cy="290" r="5" fill="#00bcd4" className="glow-cyan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        />

        {/* ── Handshake + Horses ── */}
        <motion.g
          animate={{ rotate: [-3, 3, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "200px 250px" }}
        >
          {/* Haye! Horse (Left — Copper) */}
          <motion.path
            d="M120 220 Q100 200 120 180 Q140 170 160 180 Q180 200 160 220 Z M150 190 L170 195"
            fill="#cd7f32" stroke="#b87333" strokeWidth="2"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* EazyRide Horse (Right — Gold) */}
          <motion.path
            d="M320 220 Q340 200 320 180 Q300 170 280 180 Q260 200 280 220 Z M290 190 L270 195"
            fill="#ffd700" stroke="#daa520" strokeWidth="2"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Handshake Arm — GSAP animates path d after 3s delay */}
          <path
            ref={handshakeRef}
            d="M160 250 Q200 240 240 250"
            stroke="#ffd700" strokeWidth="18" strokeLinecap="round" fill="none"
            className="glow-gold"
          />
        </motion.g>

        {/* Arabic/English Unity */}
        {lang === "ar" ? (
          <motion.text x="250" y="80" textAnchor="middle" fill="#ffd700" fontSize="22" fontWeight="bold"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          >الوحدة قوة</motion.text>
        ) : (
          <motion.text x="250" y="100" textAnchor="middle" fill="#ffd700" fontSize="20" fontWeight="bold"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          >Unity is Power</motion.text>
        )}

        <motion.text x="250" y="460" textAnchor="middle" fill="#ffd700" fontSize="16" opacity="0.9"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
        >Powered by Somali</motion.text>

        {/* Camels + Trees (Trot In) */}
        <motion.g initial={{ x: -100 }} animate={{ x: 0 }} transition={{ delay: 2, duration: 1.5, type: "spring" }}>
          <ellipse cx="150" cy="430" rx="20" ry="12" fill="#daa520" />
          <path d="M140 410 Q150 420 160 415" fill="#cd853f" />
          <ellipse cx="320" cy="430" rx="20" ry="12" fill="#daa520" />
          <path d="M310 410 Q320 420 330 415" fill="#cd853f" />
          <rect x="100" y="380" width="10" height="50" rx="5" fill="#228b22" />
          <rect x="380" y="380" width="10" height="50" rx="5" fill="#228b22" />
        </motion.g>

        {/* Orbiting Planets */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "250px 250px" }}>
          <circle cx="80" cy="120" r="8" fill="#00bcd4" className="glow-cyan" />
        </motion.g>
        <motion.g animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "250px 250px" }}>
          <circle cx="420" cy="120" r="6" fill="#ffd700" className="glow-gold" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

/* ─── Hero Section ─── */
function Hero({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  const fireConfetti = useCallback(() => {
    confetti({ spread: 360, startVelocity: 30, particleCount: 150, colors: ['#ffd700', '#00bcd4', '#cd7f32'], origin: { y: 0.7 } });
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-700 to-black relative overflow-hidden">
      <Particles id="hero-particles" options={particleOptions} className="absolute inset-0 z-0" />

      <motion.div style={{ y: heroY }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto"><HeroSVG lang={lang} /></div>
      </motion.div>

      <motion.div className="relative z-20 flex items-center justify-center min-h-screen px-4 text-white" style={{ y: heroY }}>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-cyan to-copper bg-clip-text text-transparent">{t('heroTitle')}</h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90">{t('heroSub')}</p>
          <motion.div className="flex flex-wrap justify-center gap-4" variants={stagger} initial="hidden" animate="visible">
            <motion.a href="#downloads" variants={fadeUp}>
              <motion.button whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(255,215,0,0.6)' }} whileTap={{ scale: 0.95 }}
                onClick={fireConfetti}
                className="bg-gradient-to-r from-gold to-copper px-10 py-5 rounded-2xl text-navy-900 font-bold text-lg shadow-2xl glow-pulse cursor-pointer transition-all">
                <MapPin className="inline w-5 h-5 mr-2 -mt-1" />{t('ctaRide')}
              </motion.button>
            </motion.a>
            <motion.a href="#downloads" variants={fadeUp}>
              <motion.button whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(0,188,212,0.6)' }} whileTap={{ scale: 0.95 }}
                onClick={fireConfetti}
                className="bg-gradient-to-r from-cyan to-gold px-10 py-5 rounded-2xl text-navy-900 font-bold text-lg shadow-2xl glow-pulse cursor-pointer transition-all">
                <Smartphone className="inline w-5 h-5 mr-2 -mt-1" />{t('ctaFood')}
              </motion.button>
            </motion.a>
            <motion.a href="#downloads" variants={fadeUp}>
              <motion.button whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(205,127,50,0.6)' }} whileTap={{ scale: 0.95 }}
                onClick={fireConfetti}
                className="bg-gradient-to-r from-copper to-gold px-10 py-5 rounded-2xl text-navy-900 font-bold text-lg shadow-2xl glow-pulse cursor-pointer transition-all">
                <Clock className="inline w-5 h-5 mr-2 -mt-1" />{t('ctaCars')}
              </motion.button>
            </motion.a>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="mt-8 text-gold text-lg animate-pulse">✨ Drag the SVG to interact!</motion.p>
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-gold text-4xl">↓</motion.div>
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
        <motion.h2 initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          className="text-4xl md:text-5xl font-bold text-center mb-20 text-gold glow-gold">{t('services.title')}</motion.h2>
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -60 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.03, y: -8, boxShadow: '0 0 40px rgba(0,188,212,0.4)' }}
            className="bg-navy-700/60 backdrop-blur-xl p-10 rounded-3xl border border-cyan/30 hover:border-cyan/60 shadow-2xl group transition-all">
            <motion.img src="/EazyRide-logo-removebg-preview.png" alt="EazyRide" className="w-20 mx-auto mb-6 group-hover:animate-pulse"
              whileHover={{ scale: 1.15, rotate: 360 }} />
            <h3 className="text-3xl font-bold mb-6 text-cyan">{t('services.eazyride')}</h3>
            <motion.ul className="space-y-3 text-lg opacity-90" variants={staggerContainer} initial="hidden" whileInView="show">
              <motion.li variants={staggerItem} className="flex items-start"><span className="w-2 h-2 bg-cyan rounded-full mt-2 mr-3 flex-shrink-0" />{t('services.desc1')}</motion.li>
              <motion.li variants={staggerItem} className="flex items-start"><span className="w-2 h-2 bg-cyan rounded-full mt-2 mr-3 flex-shrink-0" />{t('services.desc2')}</motion.li>
            </motion.ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 60 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.03, y: -8, boxShadow: '0 0 40px rgba(255,215,0,0.4)' }}
            className="bg-navy-700/60 backdrop-blur-xl p-10 rounded-3xl border border-gold/30 hover:border-gold/60 shadow-2xl group transition-all">
            <img src="/Haye!.jpeg" alt="Haye!" className="w-20 mx-auto mb-6 group-hover:animate-pulse rounded-2xl" />
            <h3 className="text-3xl font-bold mb-6 text-gold">{t('services.haye')}</h3>
            <motion.ul className="space-y-3 text-lg opacity-90" variants={staggerContainer} initial="hidden" whileInView="show">
              <motion.li variants={staggerItem} className="flex items-start"><span className="w-2 h-2 bg-gold rounded-full mt-2 mr-3 flex-shrink-0" />{t('services.desc3')}</motion.li>
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Benefits ─── */
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
        <motion.h2 initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-gold to-cyan bg-clip-text text-transparent glow-cyan">{t('benefits.title')}</motion.h2>
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {roles.map((role, i) => {
            const benefitsList = t(`benefits.${role}.benefits`, { returnObjects: true });
            return (
              <motion.div key={role} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.2 }} whileHover={{ scale: 1.02, y: -10, boxShadow: '0 0 40px rgba(255,215,0,0.3)' }}
                className="bg-navy-700/70 backdrop-blur-xl p-10 rounded-3xl border border-gold/30 hover:border-cyan/50 shadow-2xl group cursor-pointer transition-all">
                <h3 className="text-3xl font-bold mb-4 text-gold">{t(`benefits.${role}.who`)}</h3>
                <p className="text-xl mb-6 opacity-90 italic">{t(`benefits.${role}.for`)}</p>
                <motion.ul className="space-y-3 text-lg" variants={staggerContainer} initial="hidden" whileInView="show">
                  {Array.isArray(benefitsList) && benefitsList.map((benefit: any, j: number) => (
                    <motion.li key={j} variants={staggerItem} whileHover={{ x: 10 }} className="flex items-start group-hover:text-cyan transition-colors">
                      <span className="w-2 h-2 bg-cyan rounded-full mt-2 mr-4 flex-shrink-0" /> {benefit}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            );
          })}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="overflow-x-auto">
          <table className="w-full text-left bg-navy-800/50 backdrop-blur-xl rounded-2xl border border-navy-500/50">
            <thead><tr className="border-b border-gold/30">
              <th className="p-4 text-gold font-bold">{t('benefits.table.app')}</th>
              <th className="p-4 text-gold font-bold">{t('benefits.table.who')}</th>
              <th className="p-4 text-gold font-bold">{t('benefits.table.mainBenefit')}</th>
            </tr></thead>
            <tbody>
              {tableRows.map((row, i) => (
                <motion.tr key={i} whileHover={{ backgroundColor: 'rgba(255,215,0,0.1)' }} className="hover:glow-gold transition-all border-b border-navy-500/30 last:border-0">
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
  const [downloadCount, setDownloadCount] = useState(0);

  const apks = [
    { name: t('downloads.rider'), file: 'EazyRide-Rider-v3.0.0.apk', size: '37 MB' },
    { name: t('downloads.driver'), file: 'EazyRide-Driver-v3.0.0.apk', size: '37 MB' },
    { name: t('downloads.store'), file: 'EazyRide-StoreOwner-v3.0.0.apk', size: '187 MB' },
    { name: t('downloads.provider'), file: 'EazyRide-Provider-v3.0.0.apk', size: '68 MB' }
  ];

  const handleDownload = useCallback((file: string) => {
    if (!termsAccepted) { setShowWarning(true); return; }
    const link = document.createElement('a');
    link.href = `${RELEASE_BASE}${file}`;
    link.target = '_blank';
    link.click();
    setDownloadCount(c => c + 1);
    confetti({ spread: 360, startVelocity: 30, particleCount: 150, colors: ['#ffd700', '#00bcd4', '#cd7f32'], origin: { y: 0.7 } });
  }, [termsAccepted]);

  return (
    <section ref={ref} id="downloads" className="py-32 px-4 bg-gradient-to-b from-navy-700 to-navy-900 relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h2 initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="text-4xl font-bold text-center mb-10 text-gold">{t('downloads.title')}</motion.h2>
        {downloadCount > 0 && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-gold text-lg mb-4 font-bold">⭐ {downloadCount} download{downloadCount > 1 ? 's' : ''} triggered!</motion.p>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="mb-10 flex flex-col items-center gap-2">
          <label className="flex items-start gap-3 cursor-pointer group text-white text-base max-w-xl">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => { setTermsAccepted(e.target.checked); if (e.target.checked) setShowWarning(false); }}
              className="mt-1 w-5 h-5 accent-gold rounded cursor-pointer shrink-0" />
            <span>{t('terms.agree')}{' '}
              <button type="button" onClick={() => setShowTerms(true)} className="text-cyan hover:text-gold underline underline-offset-2 font-semibold cursor-pointer">
                <FileText className="inline w-4 h-4 mr-1 -mt-0.5" />{t('terms.link')}</button>
            </span>
          </label>
          {showWarning && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm font-semibold text-center">⚠️ {t('terms.mustAgree')}</motion.p>}
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apks.map((apk, i) => (
            <motion.button key={i} whileHover={{ scale: 1.08, boxShadow: '0 0 40px rgba(0,188,212,0.5)' }} whileTap={{ scale: 0.97 }}
              onClick={() => handleDownload(apk.file)}
              className={`group bg-navy-700/80 p-8 rounded-3xl backdrop-blur-xl shadow-2xl border border-cyan/30 hover:border-gold/50 hover:bg-gold/10 text-white transition-all cursor-pointer relative overflow-hidden glow-pulse ${!termsAccepted ? 'opacity-60' : ''}`}>
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
    initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => setParticlesReady(true));
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const handleLangSwitch = (newLang: string) => {
    setLang(newLang);
    confetti({ angle: 90, spread: 30, particleCount: 30, colors: ['#ffd700', '#00bcd4'], origin: { y: 0.3 } });
  };

  return (
    <div className="font-sans antialiased">
      <MouseTrail />
      <ProgressBar />
      <UnityMeter />
      <Ticker />
      <Quiz lang={lang} />
      <NewsletterPopup />

      {/* Global Starfield */}
      {particlesReady && <Particles id="starfield" options={starfieldOptions} className="fixed inset-0 z-0 pointer-events-none" />}

      <nav className="fixed top-0 w-full bg-navy-900/95 backdrop-blur-xl z-50 px-4 py-4 border-b border-navy-500/50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.img src="/EazyRide-logo-removebg-preview.png" alt="EazyRide" className="w-14 cursor-pointer"
            whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }} />
          <motion.div className="flex space-x-2 rtl:space-x-reverse">
            <button onClick={() => handleLangSwitch('en')} className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${lang === 'en' ? 'bg-gold text-navy-900 glow-pulse' : 'bg-navy-700 text-white hover:bg-navy-500'}`}>{t('switchEn')}</button>
            <button onClick={() => handleLangSwitch('so')} className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${lang === 'so' ? 'bg-gold text-navy-900 glow-pulse' : 'bg-navy-700 text-white hover:bg-navy-500'}`}>{t('switchSo')}</button>
            <button onClick={() => handleLangSwitch('ar')} className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${lang === 'ar' ? 'bg-gold text-navy-900 glow-pulse' : 'bg-navy-700 text-white hover:bg-navy-500'}`}>{t('switchAr')}</button>
          </motion.div>
        </div>
      </nav>

      {particlesReady && <Hero lang={lang} />}
      <Services />
      <Benefits />
      <Downloads />

      <footer className="py-16 bg-navy-900 text-center text-gray-400 border-t border-navy-500/50">
        <p>&copy; 2026 EazyRide + Haye! | Laascaanood Pride | <a href="mailto:support@eazyride.so" className="text-gold hover:underline">Contact</a></p>
      </footer>
    </div>
  );
}
