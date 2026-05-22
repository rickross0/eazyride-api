import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Car, 
  Package, 
  Wallet, 
  ShieldCheck, 
  Download, 
  Menu, 
  X,
  Smartphone,
  MapPin,
  ArrowRight,
  Bike,
  Zap,
  CheckCircle2,
  Users,
  SmartphoneNfc
} from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
      <img src="https://haye.ng/wp-content/uploads/2024/04/Haye-Logo-1.png" alt="Haye Logo" className="w-full h-full object-contain relative z-10" 
           onError={(e) => {
             e.currentTarget.src = ""; // Fallback to CSS logo if image fails
             e.currentTarget.className = "hidden";
           }} />
      <span className="text-3xl font-bold bg-gradient-to-br from-yellow-400 to-yellow-600 bg-clip-text text-transparent relative z-10 font-['Space_Grotesk']">H!</span>
    </div>
    <span className="text-2xl font-black tracking-tighter text-white font-['Space_Grotesk']">Haye<span className="text-yellow-500">!</span></span>
  </div>
);

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'How it Works', href: '#how' },
    { name: 'Safety', href: '#safety' },
    { name: 'Earnings', href: '#earnings' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4 bg-black/90 backdrop-blur-2xl border-b border-white/5' : 'py-8 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Logo />
        
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-semibold text-gray-400 hover:text-yellow-400 transition-all uppercase tracking-widest">
              {link.name}
            </a>
          ))}
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            Join Haye!
          </button>
        </div>

        <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 bg-black flex flex-col p-10 pt-32 gap-8 md:hidden"
          >
            <button className="absolute top-8 right-8 text-white" onClick={() => setMobileMenuOpen(false)}><X size={32} /></button>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-4xl font-bold text-white hover:text-yellow-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            <a href="https://github.com/rickross0/eazyride-super-app/raw/master/EazyRide-Haye-v5.1.0.apk" className="mt-auto bg-yellow-500 text-black py-5 rounded-2xl font-black text-xl uppercase text-center">Download App</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const { scrollYProgress } = useScroll();

  return (
    <section className="relative min-h-[100vh] flex items-center pt-24 overflow-hidden bg-black">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-yellow-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-800/20 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 bg-zinc-900/80 border border-white/10 px-5 py-2.5 rounded-full mb-8 backdrop-blur-md"
          >
            <Zap size={16} className="text-yellow-500 fill-current" />
            <span className="text-yellow-500 text-xs font-black uppercase tracking-[0.2em]">The Super App has evolved</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tighter">
            EazyRide is now <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700">Haye!</span>
          </h1>
          
          <p className="text-zinc-400 text-xl md:text-2xl mb-12 max-w-xl leading-relaxed font-light">
            Everything you loved about EazyRide, now 1000% more refined. Experience the future of rides, deliveries, and micro-mobility.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-16">
            <a href="https://github.com/rickross0/eazyride-super-app/raw/master/EazyRide-Haye-v5.1.0.apk" className="flex items-center justify-center gap-4 bg-white text-black px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-yellow-500 transition-all group shadow-2xl">
              <Download size={24} />
              Install Now
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </a>
            <button className="flex items-center justify-center gap-4 bg-zinc-900 border border-white/10 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-zinc-800 transition-all">
              <Users size={24} />
              Partner with Us
            </button>
          </div>

          <div className="flex gap-12 border-t border-white/5 pt-10">
            {[
              { label: 'Downloads', val: '1M+' },
              { label: 'Reliability', val: '99.9%' },
              { label: 'Countries', val: '15+' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-black text-white mb-1">{stat.val}</div>
                <div className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="relative"
          style={{ scale: useTransform(scrollYProgress, [0, 0.2], [1, 1.1]) }}
        >
          {/* Main Visual: Floating iPhone */}
          <motion.div 
            animate={{ y: [0, -30, 0], rotate: [0, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 mx-auto w-[320px] h-[660px] bg-zinc-900 rounded-[3.5rem] p-4 border-[12px] border-zinc-800 shadow-[0_50px_100px_-20px_rgba(234,179,8,0.2)]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-zinc-800 rounded-b-3xl" />
            <div className="h-full w-full rounded-[2.5rem] bg-black overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 to-transparent" />
               <div className="p-8 space-y-6 pt-12">
                  <div className="flex justify-between items-center">
                    <Logo />
                  </div>
                  <div className="space-y-4">
                    <div className="h-32 w-full bg-zinc-800/50 rounded-3xl border border-white/5 flex items-center justify-center">
                       <Car size={40} className="text-yellow-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-24 bg-zinc-800/50 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2">
                          <Bike size={24} className="text-zinc-400" />
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Renting</span>
                       </div>
                       <div className="h-24 bg-zinc-800/50 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2">
                          <Package size={24} className="text-zinc-400" />
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Courier</span>
                       </div>
                    </div>
                    <div className="h-20 w-full bg-yellow-500 rounded-[2rem] flex items-center justify-center text-black font-black uppercase text-sm tracking-widest">
                       Book Now
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Floaters for "1000% Better" feel */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute -right-12 top-1/4 z-20 bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">Instant Match</div>
                <div className="text-lg font-black text-white">Driver Found!</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    { icon: Car, title: "Haye! Ride", desc: "Professional, vetted drivers for your daily commute. Choose from Economy to Premium Luxe.", color: "from-blue-500/20" },
    { icon: Bike, title: "Micro-Mobility", desc: "The core of EazyRide evolution. Rent e-bikes and scooters instantly via the app.", color: "from-yellow-500/20" },
    { icon: Package, title: "Flash Courier", desc: "Same-city delivery in under 45 minutes. Real-time tracking from pickup to drop-off.", color: "from-green-500/20" },
    { icon: Wallet, title: "Haye! Pay", desc: "Secure digital wallet for all your services. Split fares and send money to friends instantly.", color: "from-purple-500/20" },
    { icon: ShieldCheck, title: "Safety Shield", desc: "24/7 incident response, live location sharing, and emergency SOS integration.", color: "from-red-500/20" },
    { icon: SmartphoneNfc, title: "Fleet Mgmt", desc: "Scalable SaaS solutions for micro-mobility entrepreneurs to launch their own fleet.", color: "from-zinc-500/20" }
  ];

  return (
    <section id="services" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-yellow-500 font-black uppercase tracking-[0.3em] text-sm mb-4 block">Our Ecosystem</span>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter">
              One App. <br />
              <span className="text-zinc-600 italic font-serif">Infinite Solutions.</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-yellow-500/50 transition-all duration-500 relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="mb-8 p-5 rounded-2xl bg-zinc-800 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500 inline-block">
                  <s.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{s.title}</h3>
                <p className="text-zinc-400 leading-relaxed font-light group-hover:text-zinc-200 transition-colors">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Pick Your Need", desc: "Open the app and select Ride, Parcel, or Scooter rental.", icon: MapPin },
    { title: "Get Matched", desc: "Our AI matches you with the nearest resource in seconds.", icon: Zap },
    { title: "Move Seamlessly", desc: "Track in real-time and pay securely with Haye! Pay.", icon: Smartphone }
  ];

  return (
    <section id="how" className="py-32 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">Simple As <span className="text-yellow-500 italic">One-Two-Three</span></h2>
          <p className="text-zinc-500 text-xl max-w-2xl mx-auto">We've removed the friction from city living. Moving should be effortless.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent z-0" />
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-yellow-500 mb-8 shadow-2xl relative group">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <step.icon size={40} className="relative z-10" />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-black text-sm">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Partners = () => (
  <section id="earnings" className="py-32 bg-black border-y border-white/5">
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
        <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
          Drive. Deliver. <br />
          <span className="text-yellow-500">Earn with Pride.</span>
        </h2>
        <div className="space-y-6 mb-12">
          {[
            "Industry-leading commission rates",
            "Instant payouts directly to Haye! Pay",
            "Full insurance coverage on every trip",
            "Flexible hours - you are the boss"
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-4 text-zinc-300">
              <CheckCircle2 size={24} className="text-yellow-500 flex-shrink-0" />
              <span className="text-lg font-medium">{text}</span>
            </div>
          ))}
        </div>
        <button className="bg-white text-black px-12 py-5 rounded-full font-black text-xl uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-2xl">
          Become a Partner
        </button>
      </motion.div>

      <div className="relative p-10 bg-zinc-900 rounded-[3rem] border border-white/10 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full" />
         <div className="relative z-10 space-y-8">
            <div className="p-6 bg-black/50 rounded-3xl border border-white/5 flex justify-between items-center">
               <div>
                 <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Today's Earnings</div>
                 <div className="text-4xl font-black text-white">$148.50</div>
               </div>
               <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-black">
                 <Wallet size={32} />
               </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-zinc-800/30 rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-700" />
                   <div className="flex-1">
                      <div className="h-2 w-24 bg-zinc-600 rounded mb-2" />
                      <div className="h-2 w-16 bg-zinc-700 rounded" />
                   </div>
                   <div className="text-green-500 font-bold">+$12.00</div>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-black pt-32 pb-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-2">
          <Logo />
          <p className="mt-8 text-zinc-500 text-lg max-w-sm leading-relaxed">
            Leading the evolution of urban mobility. From EazyRide's foundations to Haye!'s premium future.
          </p>
          <div className="flex gap-4 mt-10">
            {['Twitter', 'Instagram', 'LinkedIn', 'Facebook'].map(social => (
              <a key={social} href="#" className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all">
                <span className="sr-only">{social}</span>
                <div className="w-5 h-5 bg-current opacity-50" />
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-black uppercase tracking-widest mb-8">Solutions</h4>
          <ul className="space-y-4 text-zinc-500 font-medium">
            <li><a href="#" className="hover:text-yellow-500">Rider App</a></li>
            <li><a href="#" className="hover:text-yellow-500">Partner App</a></li>
            <li><a href="#" className="hover:text-yellow-500">Business Dash</a></li>
            <li><a href="#" className="hover:text-yellow-500">Fleet SaaS</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-black uppercase tracking-widest mb-8">Contact</h4>
          <ul className="space-y-4 text-zinc-500 font-medium">
            <li>Support Center</li>
            <li>Press Relations</li>
            <li>Safety Hub</li>
            <li>Legal Inquiries</li>
          </ul>
        </div>
      </div>
      
      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-zinc-600 text-sm">
          © 2026 Haye! Mobility (Formerly EazyRide). Built for the next billion users.
        </div>
        <div className="flex gap-8 text-sm text-zinc-600 font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="bg-black text-white font-['Inter'] selection:bg-yellow-500 selection:text-black antialiased">
      <Nav />
      <Hero />
      <Services />
      <HowItWorks />
      <Partners />
      <Footer />
    </div>
  );
}
