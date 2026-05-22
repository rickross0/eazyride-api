import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIChatbotProps {
  lang: string;
}

const responses: Record<string, Record<string, string>> = {
  en: {
    ride: 'Try the Rider App for fast, safe rides in Laascaanood! 🚗',
    driver: 'Join as a Driver and start earning today! 💰',
    food: 'Order delicious meals with Haye! Food Delivery! 🍔',
    car: 'Rent reliable cars for your journey! 🚙',
    store: 'Expand your restaurant with Haye! Store Owner app! 🏪',
    provider: 'Manage your fleet with the Provider app! 🏢',
    default: 'I can help you find the right EazyRide app! Ask about rides, food, cars, or stores.'
  },
  so: {
    ride: 'Isku day Rider App si aad u hesho raac degdeg ah Laascaanood! 🚗',
    driver: 'Ku biir Driver-ka oo maanta bilow kastidka! 💰',
    food: 'Dalbo cunto la-dhacsan adiga oo isticmaalaya Haye! 🍔',
    car: 'Kirey gaadiid la hubo oo aad ku safarto! 🚙',
    store: 'Ballaar maqaayaddaada adiga oo isticmaalaya Haye! 🏪',
    provider: 'Maaree gaadiidkaaga adiga oo isticmaalaya Provider app! 🏢',
    default: 'Waan ku caawin karaa inaad hesho app-ka saxda ah! Weydii raac, cunto, gaadiid, ama maqaayad.'
  },
  ar: {
    ride: 'جرب تطبيق الراكب للحصول على رحلات سريعة وآمنة في لاسعانود! 🚗',
    driver: 'انضم كسائق وابدأ الكسب اليوم! 💰',
    food: 'اطلب وجبات لذيذة مع تطبيق هاي للتوصيل! 🍔',


    store: 'وسع مطعمك مع تطبيق صاحب المتجر! 🏪',
    provider: 'أدر أسطولك مع تطبيق المزود! 🏢',
    default: 'يمكنني مساعدتك في العثور على تطبيق EazyRide المناسب! اسأل عن الرحلات أو الطعام أو السيارات أو المتاجر.'
  }
};

export default function AIChatbot({ lang }: AIChatbotProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'bot' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getResponse = (q: string): string => {
    const lower = q.toLowerCase();
    const map = responses[lang] || responses.en;
    if (lower.includes('ride') || lower.includes('raac') || lower.includes('رحلة')) return map.ride;
    if (lower.includes('drive') || lower.includes('darawal') || lower.includes('سائق')) return map.driver;
    if (lower.includes('food') || lower.includes('cunto') || lower.includes('cunto') || lower.includes('طعام') || lower.includes('أكل')) return map.food;
    if (lower.includes('car') || lower.includes('gaadiid') || lower.includes('سيارة')) return map.car;
    if (lower.includes('store') || lower.includes('maqaayad') || lower.includes('متجر')) return map.store;
    if (lower.includes('provider') || lower.includes('fleet') || lower.includes('مزود')) return map.provider;
    return map.default;
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const userMsg = query.trim();
    const botReply = getResponse(userMsg);
    
    setMessages(prev => [...prev, { text: userMsg, from: 'user' }, { text: botReply, from: 'bot' }]);
    setQuery('');
    
    // Speak response
    if (window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance(botReply);
      msg.lang = lang === 'so' ? 'so-SO' : lang === 'ar' ? 'ar-SA' : 'en-US';
      msg.rate = 0.95;
      window.speechSynthesis.speak(msg);
    }
    
    // Confetti for ride-related queries
    if (userMsg.toLowerCase().includes('ride') || userMsg.toLowerCase().includes('raac') || userMsg.toLowerCase().includes('رحلة')) {
      confetti({ particleCount: 150, spread: 360, startVelocity: 30, colors: ['#ffd700', '#00bcd4'], origin: { y: 0.7 } });
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan to-gold text-navy-900 p-4 rounded-full shadow-2xl glow-cyan cursor-pointer"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 left-6 md:left-auto md:w-96 bg-navy-800/95 backdrop-blur-xl p-5 rounded-3xl z-50 border border-cyan/30 shadow-2xl glow-cyan"
          >
            <div ref={scrollRef} className="h-48 overflow-y-auto mb-4 space-y-3 pr-1">
              {messages.length === 0 && (
                <p className="text-gray-400 text-sm text-center italic">
                  {lang === 'so' ? 'Weydii wax kasta...' : lang === 'ar' ? 'اسأل عن أي شيء...' : 'Ask me anything...'}
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] ${m.from === 'user' ? 'bg-cyan text-navy-900' : 'bg-navy-700 text-white border border-gold/30'}`}>
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={lang === 'so' ? 'Weydii: Raac? Cunto?' : lang === 'ar' ? 'اسأل: رحلة؟ طعام؟' : 'Ask: Rides? Food?'}
                className="flex-1 p-3 bg-navy-900 rounded-2xl text-white text-sm border border-navy-500 focus:border-cyan focus:outline-none"
              />
              <motion.button
                onClick={handleSend}
                whileTap={{ scale: 0.95 }}
                className="bg-gold text-navy-900 p-3 rounded-2xl font-bold shadow-lg"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
