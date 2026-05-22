import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale } from 'lucide-react';

export default function TermsModal({ open, onClose, onOpenLegal }: { open: boolean; onClose: () => void; onOpenLegal: () => void }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const title = lang === 'ar' ? 'الشروط والأحكام' : lang === 'so' ? "Shuruudaha & Qaa'dada" : 'Terms & Conditions';
  const closeText = lang === 'ar' ? 'إغلاق' : lang === 'so' ? 'Xir' : 'Close';
  const viewAllText = lang === 'ar' ? 'عرض جميع المستندات القانونية' : lang === 'so' ? 'Arag Dhammaan Warqadaha Sharciga' : 'View All Legal Documents';

  const TERMS_EN = `TERMS & CONDITIONS — SUMMARY

Effective Date: April 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD | Operating Region: Somalia

1. ACCEPTANCE
By using EazyRide-Haye!, you agree to these Terms. They apply to all users: riders, drivers, customers, providers, restaurants, and admins.

2. ACCOUNT REGISTRATION
You must be 18+ with a valid phone number. Drivers and providers require additional documentation and platform approval.

3. RIDER & CUSTOMER DUTIES
You are responsible for keeping your account credentials safe. You must not let others use your profile. In case of fraud, you can request account suspension (24-hour minimum).

4. SERVICES
- Ride-hailing (EazyRide): Fare estimates are approximate. Surge pricing displayed before booking.
- Food delivery (Haye!): Orders confirmed only when restaurant accepts. Delivery times are estimates.
- Car rental (Haye! Services): We are a marketplace connecting you with providers. Each provider has their own terms. $2.50 cancellation/no-show fee (waivable by admin).

5. PAYMENTS
All payments via WaafiPay (EVC/Zaad). Platform commission: 15% rides, 15-20% food, 10-20% car rental. Weekly driver/provider payouts.

6. LIABILITY
The Platform is a technology intermediary. Insurance is not available under current Somali practice. Every user of a motor vehicle is personally liable if deemed at fault.

7. GOVERNING LAW
Laws of the Federal Republic of Somalia. All rights governed by BinMahfuud LTD.

Contact: support@eazyride.com`;

  const TERMS_SO = `SHURUUDHA & QAA'DADA — KOOSAAN

Taariikhda: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD | Gobolka Hawlgalka: Soomaaliya

1. OGOLAANSHO
Adiga oo isticmaalaya EazyRide-Haye!, waad ogolaysanaysaa shuruudahan.

2. DIIWAANGELINTA
Waa inaad ka da' weyn tahay 18 sano. Darawalka iyo bixiyayaashu way u baahan yihiin documents dheeraad ah.

3. WAAJIBKA RIDAAGA & MACAAMILKA
Adiga ayaa mas'uul ka ah ilaalinta akhbaarka koontadaada. Ha ogoleyn qof kale inuu isticmaalo profile-kaaga. Haddii falsad dhacdo, way dalbi kartaa jabin (ugu yaraan 24 saac).

4. ADEEGYADA
- Safar-celinta (EazyRide): Qiimaha waa qiyaas. Surge pricing la muujinayaa.
- Gaadiidka cunto (Haye!): Dalbashadu ma xaqiijiyay ilaa maqaayadu aqbasho.
- Kirada gaadiidka (Haye! Services): Waa suuq isku xira. $2.50 burburin/no-show (admin waa caafimaadi karaa).

5. LACAG-BIXINTA
Dhammaan WaafiPay (EVC/Zaad). Komishan: 15% safarro, 15-20% cunto, 10-20% kirada.

6. MAS'UULIYADDA
Barxaddu waa technology intermediary. Insurance ma jiro Soomaaliya. Kasta oo isticmaalaya baabuur wuxuu mas'uul yahay haddii khalad la arkay.

7. SHARCIGA
Sharciga Soomaaliya. Dhammaan xaquuqda BinMahfuud LTD.

La xiriir: support@eazyride.com`;

  const TERMS_AR = `الشروط والأحكام — ملخص

التاريخ: أبريل 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD | منطقة التشغيل: الصومال

1. القبول
باستخدام إيزي رايد-هاي!، فإنك توافق على هذه الشروط.

2. التسجيل
يجب أن يكون عمرك 18+ برقم هاتف صالح. السائقون والمزودون يحتاجون مستندات إضافية.

3. واجبات الراكب والعميل
أنت مسؤول عن بيانات حسابك. لا تسمح للآخرين باستخدام ملفك. في حالة الاحتيال، يمكنك طلب تعليق الحساب (24 ساعة كحد أدنى).

4. الخدمات
- الرحلات (إيزي رايد): الأسعار تقديرية. التسعير المرتفع يُعرض مسبقاً.
- توصيل الطعام (هاي!): الطلبات مؤكدة عند قبول المطعم.
- إيجار السيارات (هاي! خدمات): سوق يربطك بالمزودين. رسوم إلغاء 2.50 دولار (يمكن للمشرف التنازل).

5. المدفوعات
جميعها عبر WaafiPay (EVC/Zaad). العمولة: 15% رحلات، 15-20% طعام، 10-20% إيجار.

6. المسؤولية
المنصة وسيط تقني. لا يوجد تأمين في الصومال حالياً. كل مستخدم لمركبة مسؤول شخصياً.

7. القانون الحاكم
قوانين الصومال. جميع الحقوق تحكمها BinMahfuud LTD.

تواصل: support@eazyride.com`;

  const content = lang === 'ar' ? TERMS_AR : lang === 'so' ? TERMS_SO : TERMS_EN;

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
            <h2 className="text-2xl font-bold text-gold mb-2">
              {title}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              {lang === 'ar' ? 'مملوكة لـ BinMahfuud LTD — جميع الحقوق محفوظة' : lang === 'so' ? 'Leh BinMahfuud LTD — Dhammaan xaquuqda waa la ilaalay' : 'Owned by BinMahfuud LTD — All rights reserved'}
            </p>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {content}
            </pre>
            <button
              onClick={() => { onClose(); onOpenLegal(); }}
              className="mt-6 w-full bg-gradient-to-r from-gold to-copper text-navy-900 font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
            >
              <Scale className="w-5 h-5" /> {viewAllText}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full bg-navy-700 text-gray-300 font-semibold py-3 rounded-2xl hover:bg-navy-600 transition-colors cursor-pointer"
            >
              {closeText}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
