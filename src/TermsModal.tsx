import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const TERMS_EN = `
EazyRide + Haye! — Terms & Conditions

Effective Date: April 30, 2026

1. Acceptance of Terms
By downloading, installing, or using any EazyRide + Haye! application, you agree to be bound by these Terms & Conditions.

2. Services
EazyRide + Haye! provides ride-hailing, food delivery, and car rental services in Laascaanood, Sool, Somalia. All services are subject to availability.

3. User Accounts
You must register with a valid phone number. You are responsible for keeping your account credentials secure.

4. Payments
All payments are processed via EVC mobile money. Prices are displayed in USD; conversion to SOS is applied at the live EVC rate at the time of transaction.

5. Ride & Delivery Policy
- Riders must follow safety guidelines.
- Food delivery times are estimates and may vary.
- Car rental terms are set by individual providers.

6. Cancellation & Refunds
Rides may be cancelled within 2 minutes of booking at no charge. Food orders cancelled after preparation are non-refundable. Car rental cancellations follow the provider's policy.

7. Liability
EazyRide + Haye! acts as a platform connecting users with service providers. We are not liable for direct, indirect, or consequential damages arising from the use of our services.

8. Privacy
We collect only the data necessary to provide our services. Location data is used solely for ride tracking and delivery.

9. Modifications
We reserve the right to update these terms. Continued use after updates constitutes acceptance.

10. Governing Law
These terms are governed by the laws of Somalia. Disputes shall be resolved in Laascaanood.

Contact: support@eazyride.so
`;

const TERMS_SO = `
EazyRide + Haye! — Shuruudaha & Qaa'dada

Taariikhda hawlgelinta: Abriil 30, 2026

1. Ogolaanshaha Shuruudaha
Adiga oo soo dejinaya, rakibaya, ama isticmaalaya codsiga EazyRide + Haye!, waad ogolaysanaysaa shuruudahan.

2. Adeegyada
EazyRide + Haye! waxay bixisaa adeegga safar-celinta, gaadiidka cunto, iyo kirada gaadiidka Laascaanood, Sool, Soomaaliya. Adeegyadu way ku tiirsan yihiin helitaanka.

3. Akhbaarka Isticmaalaha
Waad inaad isdiiwaangelisaa telefoon oo sax ah. Adiga ayaa mas'uul ka ah ilaalinta akhbaarka koontadaada.

4. Lacag-bixinta
Dhamaan lacag-bixintu waxay ka dhacdaa EVC mobile money. Qiimuhu waa la muujinayaa USD; bedelkeeda SOS waa la isticmaalaa sida wakhtigaas.

5. Siyaasadda Safarka & Gaadiidka
- Ridaagu waa inuu raaco tilmaamaha ammaan.
- Wakhtiyada gaadiidka cuntuhu waa qiyaas oo way isbeddeli karaan.
- Shuruudaha kirada gaadiidku way ku tiirsan yihiin bixiyaha.

6. Burburinta & Lacag-celinta
Safarada waxaa la burburin karaa gudah 2 daqiiqo oo aan lacag la qaadin. Cunto la burburiyay kadib markay diyaar garoobay ma la celi karo. Kirada gaadiidka waxay raaci doonaa siyaasadda bixiyaha.

7. Mas'uuliyadda
EazyRide + Haye! waa barxadda isku xirta isticmaalayaasha iyo bixiyayaasha. Ma masuul nahay dhibaatooyinka ka dhashay isticmaalka adeegyadeena.

8. Astaanka qarsoodiga
Waxaan ku aruurinnaa kaliya xogta loo baahanyahay adeegyada. Xogta goobta waxaa la isticmaalaa safarka raadinta iyo gaadiidka kaliya.

9. Isbeddelka
Waan xaqaaqnay inaan cusboonaysiino shuruudahan. Isticmaalka sii wada marka la cusboonaysiiyo waa ogolaansho.

10. Sharciga
Shuruudahan waxaa maamula sharciga Soomaaliya. Murannada waxaa laga xalin doonaa Laascaanood.

La xiriir: support@eazyride.so
`;

const TERMS_AR = `
إيزي رايد + هاي! — الشروط والأحكام

تاريخ السريان: 30 أبريل 2026

1. قبول الشروط
بتحميل أو تثبيت أو استخدام أي تطبيق من إيزي رايد + هاي!، فإنك توافق على الالتزام بهذه الشروط والأحكام.

2. الخدمات
إيزي رايد + هاي! توفر خدمات طلب رحلات وتوصيل طعام واستئجار سيارات في لاسعانود، صول، الصومال. جميع الخدمات تخضع للتوفر.

3. حسابات المستخدمين
يجب التسجيل برقم هاتف صالح. أنت مسؤول عن الحفاظ على بيانات حسابك.

4. المدفوعات
تتم جميع المدفوعات عبر EVC للدفع بالهاتف المحمول. الأسعار معروضة بالدولار الأمريكي؛ ويتم التحويل إلى الشلن الصومالي حسب سعر EVC وقت المعاملة.

5. سياسة الرحلات والتوصيل
- يجب على الركاب اتباع إرشادات السلامة.
- أوقات توصيل الطعام تقديرية وقد تتفاوت.
- شروط استئجار السيارات يحددها كل مزود.

6. الإلغاء والاسترداد
يمكن إلغاء الرحلات خلال دقيقتين من الحجز دون رسوم. طلبات الطعام الملغاة بعد التحضير لا تُسترد. إلغاء استئجار السيارات يتبع سياسة المزود.

7. المسؤولية
إيزي رايد + هاي! تعمل كمنصة تربط المستخدمين بمزودي الخدمات. لسنا مسؤولين عن الأضرار المباشرة أو غير المباشرة الناتجة عن استخدام خدماتنا.

8. الخصوصية
نجمع فقط البيانات الضرورية لتقديم خدماتنا. بيانات الموقع تُستخدم فقط لتتبع الرحلات والتوصيل.

9. التعديلات
نحتفظ بحق تحديث هذه الشروط. الاستمرار في الاستخدام بعد التحديث يعتبر قبولاً.

10. القانون الحاكم
تحكم هذه الشروط قوانين الصومال. تُحل النزاعات في لاسعانود.

تواصل: support@eazyride.so
`;

export default function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const title = lang === 'ar' ? 'الشروط والأحكام' : lang === 'so' ? "Shuruudaha & Qaa'dada" : 'Terms & Conditions';
  const content = lang === 'ar' ? TERMS_AR : lang === 'so' ? TERMS_SO : TERMS_EN;
  const closeText = lang === 'ar' ? 'إغلاق' : lang === 'so' ? 'Xir' : 'Close';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-navy-800 border border-navy-500/60 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gold mb-6">
              {title}
            </h2>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {content}
            </pre>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-gradient-to-r from-gold to-copper text-navy-900 font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer"
            >
              {closeText}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
