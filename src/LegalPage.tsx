import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Scale, Shield, Lock, FileText, Users, Car, AlertTriangle, CreditCard, Heart, Gavel, Eye, Database } from 'lucide-react';

interface LegalDoc {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  contentEn: string;
  contentSo: string;
  contentAr: string;
}

const LEGAL_DOCS: LegalDoc[] = [
  {
    id: 'terms',
    icon: <FileText className="w-5 h-5" />,
    titleKey: 'legal.docs.terms',
    contentEn: `TERMS AND CONDITIONS

Effective Date: April 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD
Applicable To: EazyRide-Haye! — Ride-hailing, Food Delivery & Car Rental Platform
Operating Region: Somalia

1. ACCEPTANCE OF TERMS
By accessing or using the EazyRide-Haye! platform, including all apps, you agree to be bound by these Terms and Conditions. These Terms apply to all users including riders, drivers, food delivery customers, service providers, car rental providers, and administrators.

2. DEFINITIONS
- Platform: The EazyRide-Haye! ecosystem including all apps, backend services, APIs, and websites
- Rider: A user who requests ride-hailing services through EazyRide
- Driver: A user who provides ride-hailing or delivery services through EazyRide
- Customer: A user who orders food delivery or car rental services through Haye!
- Provider: A business entity that offers car rental vehicles through the Haye! Services marketplace
- Restaurant: A food vendor registered on the Haye! marketplace
- EVC: Mobile money payment via WaafiPay (EVC/Zaad)
- WaafiPay: Third-party payment gateway for EVC/Zaad mobile money transactions

3. ACCOUNT REGISTRATION
- You must be at least 18 years old to create an account
- You must provide a valid phone number for OTP-based verification
- You must provide accurate and complete information during registration
- You are responsible for maintaining the confidentiality of your account credentials
- You must not create multiple accounts or impersonate another person
- Driver and provider registration require additional documentation and platform approval

4. RIDE-HAILING SERVICES (EazyRide)
- Riders request rides by selecting a pickup location and destination
- Fare estimates are provided before booking and are approximate
- Surge pricing may apply during periods of high demand and is displayed before booking
- A ride request is not confirmed until a driver accepts it
- Cancellation fees may apply after driver assignment
- No-show fees may be charged if rider is not at pickup location

5. FOOD DELIVERY SERVICES (Haye!)
- Customers browse menus, add items to cart, and place orders
- Orders are not confirmed until the restaurant accepts them
- Delivery times are estimates and may vary
- Cancellation before restaurant confirmation is free; after confirmation is at restaurant discretion

6. CAR RENTAL SERVICES (Haye! Services)
- EazyRide-Haye! is a marketplace connecting customers with independent car rental providers
- Each provider has their own rental terms and policies
- A security deposit is held via WaafiPay preauthorization
- Cancellation/no-show fee: $2.50 USD (waivable by admin)

7. PAYMENTS AND COMMISSIONS
- All payments processed through WaafiPay (EVC/Zaad)
- Platform commission: 15% ride-hailing, 15-20% food delivery, 10-20% car rental
- Driver payouts are processed weekly

8. INTELLECTUAL PROPERTY
All content, trademarks, logos, and software associated with EazyRide-Haye! are the exclusive property of BinMahfuud LTD.

9. LIMITATION OF LIABILITY
- The Platform connects users with service providers; it does not provide services directly
- Drivers, restaurants, and providers are independent contractors
- The Platform is not liable for accidents, injuries, food quality, or property damage
- Every user of a motor vehicle is liable if deemed at fault

10. DISPUTE RESOLUTION
- Contact Platform support first for dispute resolution
- If unresolved, disputes shall be resolved through binding arbitration in Somalia
- Class actions and class arbitrations are not permitted

11. GOVERNING LAW
These Terms are governed by the laws of the Federal Republic of Somalia.

Contact: support@eazyride.com`,
    contentSo: `SHURUUDHA & QAA'DADA

Taariikhda Hawlgelinta: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD
Ku Sofdee: EazyRide-Haye! — Adeegga Safar-celinta, Gaadiidka Cunto & Kirada Gaadiidka
Gobolka Hawlgalka: Soomaaliya

1. OGOLAANSHAH SHURUUDHA
Adiga oo isticmaalaya barxadda EazyRide-Haye!, waad ogolaysanaysaa shuruudahan. Shuruudahan waxay ku soo wada shaqeeyaan dhammaan isticmaaleyasha.

2. QEEYBTA
- Barxadda: Nidaamka EazyRide-Haye! oo ay ka mid yihiin dhammaan apps-ka
- Ridaagu: Isticmaale safar-celinta dalbada
- Darawal: Isticmaale bixiya adeegga safar-celinta
- Macaamil: Isticmaale dalba cunto ama kirada gaadiidka
- Bixiyaha: Ganacsi bixiya gaadiidka kirada
- Maqaayad: Ganacsi cunto ah oo diiwaangashan

3. DIIWAANGELINTA AKHBARKA
- Waa inaad ka da' weyn tahay 18 sano
- Waa inaad bixisaa telefoon sax ah
- Adiga ayaa mas'uul ka ah ilaalinta akhbaarka koontadaada
- Darawalka iyo bixiyayaashu way u baahan yihiin documents dheeraad ah

4. ADEEGGA SAFAR-CELINTA (EazyRide)
- Qiimaha waa qiyaas; qiimaha dhabta ah way isbeddeli kartaa
- Surge pricing waa lagu dhaqaa karaa marka codsigu badanyahay
- Burburinta ka dib marka darawal la yidhaado waxay qaadi kartaa lacag

5. ADEEGGA GAADIIDKA CUNTO (Haye!)
- Macaamilka way ka dalbi karaan cunto maqaayadaha
- Dalbashadu ma la xaqiijiyo ilaa maqaayadu aqbasho
- Wakhtiyada gaadiidku waa qiyaas

6. ADEEGGA KIRADA GAADIIDKA (Haye! Services)
- EazyRide-Haye! waa barxadda isku xirta macaamisha iyo bixiyayaasha
- Bixiyaha kastaa wuxuu leeyahay shuruudihiisa gaarka ah
- Cancellation/no-show fee: $2.50 USD (admin waa ka caafimaadi karaa)

7. LACAG-BIXINTA IYO KOMISHANKA
- Dhammaan lacag-bixintu way ka dhacdaa WaafiPay (EVC/Zaad)
- Komishanka barxadda: 15% safar-celinta, 15-20% cunto, 10-20% kirada

8. MILKIILKA FIKRADA
Dhammaan macluumaadka, sumadaha, iyo softweerkayga EazyRide-Haye! waa milkiilka BinMahfuud LTD.

9. XADIDKA MAS'UULIYADDA
- Barxaddu way isku xirtaa isticmaaleyasha; ma bixiso adeeg si toos ah
- Isticmaal kasta oo baabuur isticmaalaya wuxuu mas'uul yahay haddii la arkay inuu khalad yahay

10. XALKA MURANKA
- La xiriir taageerada barxadda marka hore
- Haddii aan la xalin karin, muranka waa la xali karaa arbitration

11. SHARCIGA
Shuruudahan waxaa maamula sharciga Soomaaliya.

La xiriir: support@eazyride.com`,
    contentAr: `الشروط والأحكام

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD
تنطبق على: إيزي رايد-هاي! — طلب رحلات، توصيل طعام واستئجار سيارات
منطقة التشغيل: الصومال

1. قبول الشروط
باستخدامك منصة إيزي رايد-هاي!، فإنك توافق على هذه الشروط والأحكام.

2. التعريفات
- المنصة: نظام إيزي رايد-هاي! بما في ذلك جميع التطبيقات
- الراكب: مستخدم يطلب خدمات توصيل الرحلات
- السائق: مستخدم يقدم خدمات التوصيل
- العميل: مستخدم يطلب توصيل طعام أو استئجار سيارات
- المزود: كيان تجاري يقدم سيارات للإيجار
- المطعم: بائع طعام مسجل

3. تسجيل الحساب
- يجب أن يكون عمرك 18 عاماً على الأقل
- يجب تقديم رقم هاتف صالح
- أنت مسؤول عن الحفاظ على بيانات حسابك

4. خدمات طلب الرحلات (إيزي رايد)
- الأسعار تقديرية وقد تختلف
- قد يُطبق تسعير الطلب المرتفع
- رسوم الإلغاء قد تُفرض بعد تعيين السائق

5. خدمات توصيل الطعام (هاي!)
- الطلبات غير مؤكدة حتى يقبل المطعم
- أوقات التوصيل تقديرية

6. خدمات استئجار السيارات (هاي! خدمات)
- إيزي رايد-هاي! سوق يربط العملاء بمزودي الإيجار
- لكل مزود شروطه الخاصة
- رسوم الإلغاء/عدم الحضور: 2.50 دولار أمريكي

7. المدفوعات والعمولات
- جميع المدفوعات عبر WaafiPay (EVC/Zaad)
- عمولة المنصة: 15% رحلات، 15-20% طعام، 10-20% إيجار سيارات

8. الملكية الفكرية
جميع المحتوى والعلامات التجارية ملكية حصرية لـ BinMahfuud LTD.

9. حدود المسؤولية
- المنصة تربط المستخدمين بمزودي الخدمات
- كل مستخدم لمركبة مسؤول إذا ثبت خطأه

10. حل النزاعات
- اتصل بدعم المنصة أولاً
- إذا لم يُحل، يتم اللجوء للتحكيم

11. القانون الحاكم
تحكم هذه الشروط قوانين الصومال.

تواصل: support@eazyride.com`,
  },
  {
    id: 'privacy',
    icon: <Eye className="w-5 h-5" />,
    titleKey: 'legal.docs.privacy',
    contentEn: `PRIVACY POLICY

Effective Date: April 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD
Operating Region: Somalia

1. INFORMATION WE COLLECT
- Account Information: Phone number, name, email, password (hashed)
- Driver Information: License number, vehicle type, plate number, payout details
- Payment Information: EVC/Zaad phone number, wallet top-up details
- GPS Location: Real-time for drivers (every 3 seconds while online), pickup/dropoff for riders
- Device Information: Model, OS version, app version
- Usage Data: Screens visited, features used, session duration
- Transaction Records: Payment amounts, methods, statuses

2. HOW WE USE YOUR INFORMATION
- Authenticate users via phone-based OTP verification
- Match riders with nearby drivers using real-time GPS
- Calculate fares and process payments via WaafiPay
- Track rides, food orders, and car rentals in real time
- Moderate user conduct and enforce Terms
- Process weekly driver and provider payouts
- Monitor for fraudulent activity

3. INFORMATION SHARING
Limited information is shared between users to facilitate services:
- Rider → Driver: Pickup/dropoff location, rider name
- Driver → Rider: Driver name, vehicle type, plate number, real-time location
- Customer → Restaurant: Order details, delivery address
- Customer → Provider: Booking dates, vehicle selection

Third-party providers:
- WaafiPay: EVC phone number, payment amount, transaction type
- Cloud Infrastructure: All Platform data stored in PostgreSQL
- Expo Push Notifications: Push notification tokens
- OSRM: Pickup and dropoff coordinates only
- Nominatim: Search query text only

4. YOUR RIGHTS
- Access: Request a copy of your data
- Correction: Update inaccurate information
- Deletion: Request account and data deletion
- Portability: Request data in machine-readable format (JSON/CSV) within 30 days
- Location control: Drivers can go offline to stop GPS broadcasting

5. DATA RETENTION
- User profiles: Duration of account + 90 days
- Transaction records: Indefinite (soft-deleted for audit)
- Driver GPS positions: 30 seconds TTL (not persisted)
- Payment records: Per WaafiPay regulatory requirements

6. CHILDREN'S PRIVACY
The Platform is not intended for persons under 18 years of age.

Contact: privacy@eazyride.com`,
    contentSo: `SIYAASADDA ASTAANKA QARSOODIGA

Taariikhda Hawlgelinta: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD

1. MACLUUMADKA AN KU ARUURINNO
- Akhbaarka Koontada: Telefoon, magaca, email, password (hashed)
- Akhbaarka Darawalka: Lambarka shatiga, nooca gaadiidka, lambarka looxa
- Akhbaarka Lacag-bixinta: EVC/Zaad telefoon, wallet top-up
- Goobta GPS: Wakhtiga dhabta ah darawal (3 ilbiriqsi gudihi), pickup/dropoff
- Akhbaarka Qalabka: Nooca, OS version, app version
- Diiwaannada Lacag-bixinta

2. SIDII AN U ISTICMAALNO AKHBARKAAGA
- Isaqrinta isticmaaleyasha OTP telefoon
- Isku xidha ridayaasha iyo darawalka agagaarka
- Xisaabinta qiimaha iyo lacag-bixinta WaafiPay
- Raadinta safarada, cunto, iyo kirada

3. WADAAGISTA AKHBARKA
- Macluumaad yar ayaa wadaagsan isticmaaleyasha dhexdooda
- WaafiPay: Telefoon EVC, qiimaha, nooca lacag-bixinta
- Cloud Infrastructure: Dhammaan xogta barxadda

4. XAQIIQDAAGA
- Helitaan: Dalbo koobi xogtaada
- Waan ka beddeli karnaa macluumaadka khaldan
- Tirtir: Dalbo tirtirka koontada iyo xogta
- Darawalku way jabi karaan GPS offline

5. ILLAAINTA XOGTA
- Profiles: Wakhtiga koontada + 90 maalin
- Diiwaannada lacag-bixinta: Way sii jiraan audit aawadeed

6. CARRUURTA
Barxaddu lagama isticmaalo qof ka yaraan 18 sano.

La xiriir: privacy@eazyride.com`,
    contentAr: `سياسة الخصوصية

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD

1. المعلومات التي نجمعها
- معلومات الحساب: رقم الهاتف، الاسم، البريد الإلكتروني
- معلومات السائق: رقم الرخصة، نوع المركبة، رقم اللوحة
- معلومات الدفع: رقم هاتف EVC/Zaad
- موقع GPS: الوقت الحقيقي للسائقين، نقاط الالتقاء

2. كيف نستخدم معلوماتك
- التحقق من المستخدمين عبر OTP
- مطابقة الركاب مع السائقين القريبين
- حساب الأجور ومعالجة المدفوعات عبر WaafiPay

3. مشاركة المعلومات
- معلومات محدودة تُشارك بين المستخدمين لتسهيل الخدمات
- WaafiPay: رقم هاتف EVC، مبلغ الدفع

4. حقوقك
- الوصول: اطلب نسخة من بياناتك
- التصحيح: حدث المعلومات غير الدقيقة
- الحذف: اطلب حذف حسابك وبياناتك

5. الاحتفاظ بالبيانات
- الملفات الشخصية: مدة الحساب + 90 يوماً
- سجلات المعاملات: غير محدد (للتدقيق)

6. خصوصية الأطفال
المنصة ليست مخصصة لمن هم دون 18 عاماً.

تواصل: privacy@eazyride.com`,
  },
  {
    id: 'rider',
    icon: <Users className="w-5 h-5" />,
    titleKey: 'legal.docs.rider',
    contentEn: `RIDER & CUSTOMER AGREEMENT

Effective Date: May 2026 | Last Updated: May 4, 2026
Between: BinMahfuud LTD, operating as EazyRide-Haye! and You
Operating Region: Somalia

1. ACCOUNT SECURITY
- You are responsible for keeping your password and account credentials safe
- You must not allow any other person to use your account
- You are responsible for all activity under your account

2. FRAUD & ACCOUNT SUSPENSION
- If you believe your account has been compromised, you may request immediate suspension
- Upon requesting fraud-based suspension, your account will be suspended for a minimum of 24 hours
- During the 24-hour suspension, you cannot use any Platform services
- After investigation, your account will be reinstated once the fraud is addressed
- False fraud claims may result in account suspension

3. RIDE-HAILING (EazyRide)
- Fare estimates are approximate; final fare may differ
- Surge pricing is displayed before booking confirmation
- Verify driver identity, vehicle type, and plate number before entering
- Wear seatbelts when available
- Do not ask drivers to break traffic laws

4. FOOD DELIVERY (Haye!)
- Orders not confirmed until restaurant accepts
- You are responsible for disclosing food allergies
- The Platform is not liable for food quality, allergies, or foodborne illness
- Delivery times are estimates and may vary

5. LIABILITY
- The Platform does not provide vehicle insurance or passenger insurance
- Insurance coverage is not available under current Somali practice
- Every user of a motor vehicle is personally liable if deemed at fault
- The Platform is a technology intermediary, not a transportation provider

Contact: support@eazyride.com | Fraud: security@eazyride.com`,
    contentSo: `HESHIISKA RIDAAGA & MACAAMILKA

Taariikhda: May 2026 | La Cusboonaysiiyay: May 4, 2026
Dhexe: BinMahfuud LTD, oo shaqeynaysa EazyRide-Haye! iyo Adiga

1. AMMAANKA AKHBARKA
- Adiga ayaa mas'uul ka ah ilaalinta password-kaaga
- Ha ogoleyn qof kale inuu isticmaalo koontadaada
- Adiga ayaa mas'uul ah dhammaan waxyaabaha koontadaada

2. FALSADDA & JABINTA AKHBARKA
- Haddii aad rumaysay in koontadaada la xirmo, way dib u jabiyaa la yaqaan
- Jabin 24 saac ayaa loo baahan yahay ugu yaraan
- Wakhtiga jabin, adeegyada ma isticmaali kartid

3. SAFAR-CELINTA (EazyRide)
- Qiimaha waa qiyaas
- Surge pricing waa la muujinayaa ka hor
- Xaqiiji shaqada darawalka, nooca gaadiidka, iyo lambarka looxa

4. GAADIIDKA CUNTO (Haye!)
- Dalbashadu ma la xaqiijiyay ilaa maqaayadu aqbasho
- Adiga ayaa mas'uul ah sheegta allergies-ka
- Barxaddu ma mas'uul ah cunto, allergies, ama cudur cunto

5. MAS'UULIYADDA
- Barxaddu ma bixiso insurance gaadiid ama ridaag
- Kasta oo isticmaalaya baabuur wuxuu mas'uul yahay haddii la arkay inuu khalad yahay

La xiriir: support@eazyride.com`,
    contentAr: `اتفاقية الراكب والعميل

تاريخ السريان: مايو 2026 | آخر تحديث: 4 مايو 2026
بين: BinMahfuud LTD، تعمل باسم إيزي رايد-هاي! وأنت

1. أمان الحساب
- أنت مسؤول عن الحفاظ على كلمة مرورك
- لا تسمح لأي شخص آخر باستخدام حسابك

2. الاحتيال وتعليق الحساب
- يمكنك طلب تعليق فوري إذا تعرض حسابك للاختراق
- يتم تعليق الحساب لمدة 24 ساعة كحد أدنى
- خلال فترة التعليق، لا يمكنك استخدام أي خدمة

3. طلب الرحلات (إيزي رايد)
- الأسعار تقديرية
- تحقق من هوية السائق ونوع المركبة قبل الركوب

4. توصيل الطعام (هاي!)
- الطلبات غير مؤكدة حتى يقبل المطعم
- أنت مسؤول عن الإفصاح عن حساسيات الطعام

5. المسؤولية
- المنصة لا توفر تأميناً على المركبات أو الركاب
- كل مستخدم لمركبة مسؤول شخصياً إذا ثبت خطؤه

تواصل: support@eazyride.com`,
  },
  {
    id: 'driver',
    icon: <Car className="w-5 h-5" />,
    titleKey: 'legal.docs.driver',
    contentEn: `DRIVER & PROVIDER AGREEMENT

Effective Date: April 2026 | Last Updated: May 4, 2026
Between: BinMahfuud LTD, operating as EazyRide-Haye! and You
Operating Region: Somalia

1. INDEPENDENT CONTRACTOR STATUS
You are an independent contractor, not an employee. You are responsible for your own vehicle, fuel, maintenance, insurance, and taxes. You are not entitled to employee benefits.

2. REGISTRATION REQUIREMENTS
- Valid driver's license recognized by Somali authorities
- Roadworthy vehicle (BAJAJ or CAR)
- Valid plate number and license number
- Platform approval (is_approved = true) required before going online

3. GPS AND LOCATION ACCURACY
- GPS location is broadcast every 3 seconds while online via Socket.io
- You must not manipulate, spoof, or falsify GPS location
- Intentional GPS manipulation results in immediate account suspension

4. COMMISSION AND EARNINGS
- Ride-hailing: 15% of total fare
- Car rental: Per-provider rate (default 10%, max 20%)
- Payouts: Weekly via EVC, bank transfer, or wallet transfer

5. RATINGS AND QUALITY
- Rating below 4.0: Quality warning
- Rating below 3.5: Temporary suspension pending review
- Rating below 3.0: Permanent deactivation

6. INSURANCE AND LIABILITY
- You are solely responsible for maintaining appropriate vehicle insurance
- The Platform does not provide vehicle insurance, health insurance, or liability insurance
- Every user of a motor vehicle is personally liable if deemed at fault

Contact: support@eazyride.com`,
    contentSo: `HESHIISKA DARAWALKA & BIXIYAHA

Taariikhda: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Dhexe: BinMahfuud LTD, oo shaqeynaysa EazyRide-Haye! iyo Adiga

1. XAQIIQDA SHAQSIYEED
Waa shaqsi madax banaan, maaha shaqaale. Adiga ayaa mas'uul ah gaadiidka, shidaalka, dayactirka, insurance-ka, iyo cashuuraha.

2. SHURUUDDA DIIWAANGELINTA
- Shati darawalid oo sax ah
- Gaadiid amaan leh (BAJAJ ama CAR)
- Lambarka looxa iyo shatiga oo sax ah
- Ogolaansha barxadda loo baahan yahay

3. GPS IYO GOOBTA
- GPS waxaa la wadaagaa 3 ilbiriqsi gudihi online la ahaado
- Manipulation-ka GPS waa mamnuuc, xirmaa waqti yar

4. KOMISHANKA IYO DAKHLIGA
- Safar-celinta: 15% qiimaha guud
- Kirada: 10% ilaa 20%
- Lacag-bixinta: Todobaadkiiba

5. TIRSI IYO TAYO
- Tirsi ka hooseeyo 4.0: Digniin tayo
- Tirsi ka hooseeyo 3.5: Jabin keme
- Tirsi ka hooseeyo 3.0: Xirid da'en

6. INSURANCE IYO MAS'UULIYAD
- Adiga ayaa mas'uul ah insurance-ka gaadiidkaaga
- Barxaddu ma bixiso insurance
- Kasta oo isticmaalaya baabuur wuxuu mas'uul yahay haddii khalad lagu arko

La xiriir: support@eazyride.com`,
    contentAr: `اتفاقية السائق والمزود

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
بين: BinMahfuud LTD، تعمل باسم إيزي رايد-هاي! وأنت

1. صفة المقاول المستقل
أنت مقاول مستقل، وليس موظفاً. أنت مسؤول عن مركبتك والوقود والصيانة والتأمين والضرائب.

2. متطلبات التسجيل
- رخصة قيادة سارية
- مركبة صالحة (باجاج أو سيارة)
- رقم لوحة ورخصة صالحان
- موافقة المنصة مطلوبة

3. نظام تحديد المواقع
- الموقع يُبث كل 3 ثوانٍ أثناء الاتصال
- التلاعب بالموقع يؤدي لتعليق فوري للحساب

4. العمولات والأرباح
- رحلات: 15% من الأجرة
- إيجار: 10-20%
- الدفعات: أسبوعية

5. التقييمات والجودة
- أقل من 4.0: تحذير جودة
- أقل من 3.5: تعليق مؤقت
- أقل من 3.0: إلغاء دائم

6. التأمين والمسؤولية
- أنت مسؤول عن تأمين مركبتك
- المنصة لا توفر تأميناً
- كل مستخدم لمركبة مسؤول شخصياً

تواصل: support@eazyride.com`,
  },
  {
    id: 'restaurant',
    icon: <CreditCard className="w-5 h-5" />,
    titleKey: 'legal.docs.restaurant',
    contentEn: `RESTAURANT / STORE-OWNER AGREEMENT

Effective Date: April 2026 | Last Updated: May 4, 2026
Between: BinMahfuud LTD, operating as EazyRide-Haye! and You
Operating Region: Somalia

1. INDEPENDENT CONTRACTOR STATUS
You are an independent business operating on the Haye! marketplace. You retain full control over menu items, recipes, pricing, operating hours, and staffing.

2. MENU AND LISTING STANDARDS
- All menu items must have accurate names, descriptions, and prices
- Platform prices must match in-store prices
- Images must accurately represent items
- Allergens must be disclosed

3. ORDER FULFILLMENT
- Accept or decline orders promptly (within 5 minutes)
- Orders not responded to within 10 minutes are auto-cancelled
- Prepare orders within stated average preparation time
- Excessive cancellations (>10%) may affect visibility

4. COMMISSION AND FEES
- Platform commission: 15-20% per restaurant
- Payouts: Weekly via EVC (WaafiPay) or bank transfer
- Commission changes: 14 days written notice

5. FOOD SAFETY AND HYGIENE
- Comply with all applicable food safety regulations in Somalia
- Disclose common allergens in menu items
- Confirmed food safety violations may result in immediate listing suspension

Contact: restaurants@eazyride.com`,
    contentSo: `HESHIISKA MAQAAYADDA / MULKIILAHADU DUKAAN

Taariikhda: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Dhexe: BinMahfuud LTD, oo shaqeynaysa EazyRide-Haye! iyo Adiga

1. XAQIIQDA SHARCIGA
Waa ganacsi madax banaan oo ku shaqeynaya suuqa Haye!

2. STANDARADKA MENU
- Dhammaan cuntooyinka waa inay yihiin sax ah
- Qiimuhu waa inay la mid yihiin dukaanka
- Allergens waa la shegayaa

3. FULINTA DALBASHADA
- Aqbi ama diid 5 daqiiqo gudihi
- 10 daqiiqo la'aan = auto-burburin
- Burburin badan (>10%) way dhimisaa muuqda

4. KOMISHANKA
- 15-20% halki maqaayad
- Lacag-bixinta: Todobaadkiiba

5. AMMAANKA CUNTO
- Raac shuruudda ammaan cunto Soomaaliya
- Sheeg allergies-ka

La xiriir: restaurants@eazyride.com`,
    contentAr: `اتفاقية المطعم / صاحب المتجر

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
بين: BinMahfuud LTD، تعمل باسم إيزي رايد-هاي! وأنت

1. صفة المقاول المستقل
أنت مشروع مستقل يعمل في سوق هاي!

2. معايير القائمة
- جميع العناصر يجب أن تكون دقيقة
- الأسعار يجب أن تتطابق مع المتجر

3. تنفيذ الطلبات
- اقبل أو ارفض خلال 5 دقائق
- 10 دقائق بدون رد = إلغاء تلقائي

4. العمولات
- 15-20% لكل مطعم
- الدفعات: أسبوعية

5. سلامة الغذاء
- التزم بلوائح سلامة الغذاء الصومالية
- أفصح عن مسببات الحساسية

تواصل: restaurants@eazyride.com`,
  },
  {
    id: 'carrental',
    icon: <Car className="w-5 h-5" />,
    titleKey: 'legal.docs.carrental',
    contentEn: `CAR RENTAL CUSTOMER TERMS (Haye! Services)

Effective Date: May 2026 | Last Updated: May 4, 2026
Between: BinMahfuud LTD, operating as EazyRide-Haye! and You
Operating Region: Somalia

1. PLATFORM ROLE — MIDDLEMAN
EazyRide-Haye! operates the Haye! Services marketplace that connects customers with independent car rental providers. The Platform does NOT own, rent, lease, or manage any vehicles. Each car rental provider has its own rental policies and terms.

2. SECURITY DEPOSIT
- A security deposit is held via WaafiPay preauthorization at booking
- The deposit is NOT charged; it is reserved and released upon satisfactory return
- Provider deductions (damage, late return) are documented with evidence
- You have 7 days to dispute any deduction

3. CANCELLATION FEE POLICY
- Cancellation at any time before pickup: $2.50 USD
- No-show (customer does not pick up vehicle): $2.50 USD
- Fee may be WAIVED by admin if you contact support with valid reason
- Provider cancellation: Full refund to customer

4. DISPUTES AND MEDIATION
- Contact the provider directly first
- If unresolved, submit dispute through the app
- If both parties agree, CARE/admin can mediate
- Mediation is voluntary and non-binding unless both parties accept

5. LIABILITY AND INSURANCE
- The Platform does not provide vehicle insurance or renter insurance
- Insurance coverage is not available under current Somali practice
- Every user of a motor vehicle is personally liable if deemed at fault
- You are responsible for damage to the vehicle during the rental

Contact: support@eazyride.com`,
    contentSo: `SHURUUDDA MACAAMILKA KIRADA GAADIIDKA (Haye! Services)

Taariikhda: May 2026 | La Cusboonaysiiyay: May 4, 2026
Dhexe: BinMahfuud LTD, oo shaqeynaysa EazyRide-Haye! iyo Adiga

1. DOORASHADA BARXADDA — DHEGELE
EazyRide-Haye! waa suuq isku xira macaamisha iyo bixiyayaasha kirada. Barxaddu ma leh, ma kireysaa, ma maamusho gaadiid.

2. DEPOSIT AMMAANKA
- Deposit waa la hayaa WaafiPay preauthorization
- Ma lacag-bixin, waa la keydiyaa ilaa la celiyo
- 7 maalin ayaad caymaysi kartaa deduction

3. LACAG BURBURINTA
- Burburin ka hor pickup: $2.50 USD
- No-show: $2.50 USD
- Admin waa ka caafimaadi karaa haddii aad la xiriirtid sabab sax ah
- Burburin bixiyaha: Lacag-celis buuxda

4. MURANKA IYO WADA-XALKA
- La xiriir bixiyaha marka hore
- Haddii aan la xalin karin, CARE/admin way wada-xali karaan
- Wada-xalku waa ikhtiyaari

5. MAS'UULIYADDA
- Barxaddu ma bixiso insurance
- Kasta oo isticmaalaya baabuur wuxuu mas'uul yahay

La xiriir: support@eazyride.com`,
    contentAr: `شروط استئجار السيارات للعملاء (هاي! خدمات)

تاريخ السريان: مايو 2026 | آخر تحديث: 4 مايو 2026
بين: BinMahfuud LTD، تعمل باسم إيزي رايد-هاي! وأنت

1. دور المنصة — وسيط
إيزي رايد-هاي! سوق يربط العملاء بمزودي الإيجار المستقلين. المنصة لا تملك أو تؤجر أي مركبات.

2. وديعة التأمين
- تُحجز عبر WaafiPay عند الحجز
- لا تُخصم؛ تُطلق عند الإرجاع المرضي
- 7 أيام للطعن في أي خصم

3. رسوم الإلغاء
- الإلغاء قبل الاستلام: 2.50 دولار أمريكي
- عدم الحضور: 2.50 دولار أمريكي
- يمكن للمشرف التنازل عنها

4. النزاعات والوساطة
- اتصل بالمزود أولاً
- يمكن للمشرف الوساطة بموافقة الطرفين

5. المسؤولية
- المنصة لا توفر تأميناً
- كل مستخدم لمركبة مسؤول شخصياً

تواصل: support@eazyride.com`,
  },
  {
    id: 'community',
    icon: <Heart className="w-5 h-5" />,
    titleKey: 'legal.docs.community',
    contentEn: `COMMUNITY GUIDELINES & SAFETY POLICY

Effective Date: April 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD
Operating Region: Somalia

1. ZERO-TOLERANCE POLICY (Immediate Permanent Deactivation)
- Physical assault or attempted assault
- Sexual misconduct or harassment
- Discrimination and hate speech
- Carrying or brandishing weapons during a ride

2. SAFETY FEATURES
- SOS Emergency Button: Alerts Platform safety team, shares real-time GPS, option to call emergency services
- Real-Time Trip Monitoring: GPS broadcast every 3 seconds, unusual route detection
- Share My Trip: Riders can share trip details with trusted contacts
- Driver Verification: License and vehicle documents verified before approval
- Delivery Pickup Verification: NFC tap / QR code / 4-digit PIN

3. INCIDENT REPORTING
- SOS Button: For immediate danger
- In-app Report: For non-urgent concerns
- Email: safety@eazyride.com
- All reports acknowledged within 24 hours
- Investigation completed within 7 business days

4. CONSEQUENCES
- Critical violations: Permanent deactivation + report to authorities
- Major violations: 30-90 day suspension
- Moderate violations: Warning + improvement plan
- Minor violations: Quality warning

Contact: safety@eazyride.com | SOS: Available in Rider and Driver Apps`,
    contentSo: `HAGAAGGA BULSHADA & SIYAASADDA AMMAANKA

Taariikhda: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD

1. SIYAASADDA EBEETO (Xirid Da'en)
- Dhaawac ama isku day dhaawac
- Xadgudubka jinsi ama caydin
- Cudur-darada iyo hadalka neceb
- Qoryaha wadista safarka

2. SIFOYINKA AMMAANKA
- Badhanka SOS: Wargelinta kooxda ammaan, GPS, wici adeegyada degdegga
- Kormeerka safarka: GPS 3 ilbiriqsi gudihi
- La wadaag safarka: Ridaagu way wadaagi karaan qaraabada
- Xaqiijinta darawalka: Shatiga iyo gaadiidka la xaqiijiyay

3. WARKEEBIN
- Badhanka SOS: Khatar degdeg ah
- Warkeebin app-guda: Cilada aan degdeg ahayn
- Email: safety@eazyride.com
- Dhammaan warkeebin waxaa la aqbaa 24 saac gudihi

4. CILADHA
- Critical: Xirid da'en + waran xukuumad
- Major: Jabin 30-90 maalin
- Moderate: Digniin + qorshe horumarin
- Minor: Digniin tayo

La xiriir: safety@eazyride.com`,
    contentAr: `إرشادات المجتمع وسياسة السلامة

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD

1. سياسة عدم التسامح (إلغاء دائم فوري)
- الاعتداء الجسدي
- التحرش الجنسي
- التمييز والخطاب الكاره
- حمل الأسلحة

2. ميزات السلامة
- زر SOS: تنبيه فريق السلامة، مشاركة GPS، اتصال بالطوارئ
- مراقبة الرحلات: GPS كل 3 ثوانٍ
- مشاركة رحلتي: مشاركة مع جهات اتصال موثوقة
- التحقق من السائق: التحقق من الرخصة والمركبة

3. الإبلاغ عن الحوادث
- زر SOS: للخطر الفوري
- إبلاغ في التطبيق: للمخاوف غير العاجلة
- البريد: safety@eazyride.com

4. العواقب
- حرجة: إلغاء دائم + إبلاغ السلطات
- كبيرة: تعليق 30-90 يوماً
- متوسطة: تحذير + خطة تحسين
- بسيطة: تحذير جودة

تواصل: safety@eazyride.com`,
  },
  {
    id: 'refund',
    icon: <CreditCard className="w-5 h-5" />,
    titleKey: 'legal.docs.refund',
    contentEn: `REFUND & RETURN POLICY

Effective Date: April 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD
Payment Gateway: WaafiPay (EVC/Zaad)

1. RIDE-HAILING REFUNDS
- Driver cancelled after acceptance: 100% refund
- Driver no-show: 100% refund
- Route deviation: Difference refunded
- Overcharge >20%: Excess refunded
- Duplicate charge: Full duplicate refunded
- Rider no-show: No refund
- Surge pricing: No refund (displayed and accepted)

2. FOOD DELIVERY REFUNDS
- Order not delivered: 100% refund
- Incorrect/missing items: Proportional refund (within 2 hours with photo)
- Restaurant cancelled: 100% refund
- Extremely late (>2x estimated): Delivery fee only
- Customer cancelled after confirmation: No refund
- Taste/preference: No refund

3. CAR RENTAL REFUNDS
- Vehicle returned satisfactorily: 100% deposit release
- Cancellation >48hrs: 100% deposit
- Cancellation 24-48hrs: 90% deposit
- Cancellation 2-24hrs: 75% deposit
- Cancellation <2hrs: 50% deposit
- No-show: 0% deposit (forfeited)
- Flat cancellation/no-show fee: $2.50 USD (waivable by admin)

4. PROCESSING TIMELINES
- In-App Wallet: Instant to 24 hours
- EVC/Zaad: 1-5 business days (via WaafiPay)
- If refund not received within 10 business days: Contact support

Contact: refunds@eazyride.com`,
    contentSo: `SIYAASADDA LACAG-CELINTA & LA CELINTA

Taariikhda: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD
Gateway-ga Lacag-bixinta: WaafiPay (EVC/Zaad)

1. LACAG-CELINTA SAFAR-CELINTA
- Darawal burburiyay: 100% la celiyaa
- Darawal ma imaan: 100% la celiyaa
- Khaadidka waddo: Farqiga la celiyaa
- Qiime kordhay >20%: Sii kordhay la celiyaa
- Ridaag ma imaan: La ma celiyo
- Surge pricing: La ma celiyo

2. LACAG-CELINTA GAADIIDKA CUNTO
- Cunto la kee la bixin: 100% la celiyaa
- Cunto khaldan/la maqan: Qaab la celiyaa (2 saac gudihi + sawir)
- Maqaayad burburtay: 100% la celiyaa
- Da'degeh (>2x): Lacag celinta gaadiidka kaliya
- Macaamil burburtay kadib: La ma celiyo

3. LACAG-CELINTA KIRADA GAADIIDKA
- Gaari la celiyo wanaagsan: 100% deposit la sii daayaa
- Burburin >48 saac: 100% deposit
- Burburin 24-48 saac: 90% deposit
- Burburin 2-24 saac: 75% deposit
- Burburin <2 saac: 50% deposit
- No-show: 0% deposit
- Lacag burburin/no-show: $2.50 USD (admin waa ka caafimaadi karaa)

4. WAKHTIYADA
- Wallet: Degdeg ilaa 24 saac
- EVC/Zaad: 1-5 maalin shaqo (WaafiPay)

La xiriir: refunds@eazyride.com`,
    contentAr: `سياسة الاسترداد والإرجاع

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD
بوابة الدفع: WaafiPay (EVC/Zaad)

1. استرداد الرحلات
- السائق ألغى: استرداد 100%
- السائق لم يحضر: استرداد 100%
- انحراف المسار: فرق مسترد
- زيادة >20%: الزيادة مستردة
- الراكب لم يحضر: لا استرداد

2. استرداد توصيل الطعام
- الطلب لم يصل: استرداد 100%
- عناصر خاطئة/مفقودة: استرداد نسبي (خلال ساعتين + صورة)
- المطعم ألغى: استرداد 100%
- تأخر شديد: رسوم التوصيل فقط

3. استرداد إيجار السيارات
- إرجاع مرضٍ: إطلاق الوديعة 100%
- إلغاء >48 ساعة: 100%
- إلغاء 24-48 ساعة: 90%
- إلغاء <2 ساعة: 50%
- عدم الحضور: 0%
- رسوم الإلغاء: 2.50 دولار أمريكي

4. المواعيد
- المحفظة: فوري إلى 24 ساعة
- EVC/Zaad: 1-5 أيام عمل

تواصل: refunds@eazyride.com`,
  },
  {
    id: 'aml',
    icon: <Shield className="w-5 h-5" />,
    titleKey: 'legal.docs.aml',
    contentEn: `AML & KYC POLICY

Effective Date: May 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD
Operating Region: Somalia

1. PURPOSE
This policy outlines EazyRide-Haye!'s commitment to preventing money laundering, terrorist financing, and fraud.

2. REGULATORY FRAMEWORK
- All EVC/Zaad transactions processed through WaafiPay which maintains its own AML/KYC policies
- The Platform complies with WaafiPay's terms of service
- No comprehensive Somali AML legislation currently exists; the Platform voluntarily adopts these practices

3. KYC PROCEDURES
Drivers are the primary user category subject to KYC:
- Full name, phone number (OTP verified), driver's license, vehicle plate number, payout method
- Platform admin reviews and approves all driver registrations before they can go online
- KYC records retained for account duration + 2 years after deactivation

Riders and customers: Phone OTP verification only. No additional documents required.

4. TRANSACTION MONITORING
The Platform monitors for patterns indicating money laundering or fraud:
- Unusually high frequency of rides/orders
- Wallet top-ups disproportionate to usage
- Frequent cancellations with refund requests
- Multiple accounts using same device/payment method

5. SUSPICIOUS ACTIVITY
Detected suspicious activity is reported to WaafiPay's compliance team. Accounts may be suspended pending investigation.

6. IDENTITY VERIFICATION
When clients contact support to update profile information, staff ask verification questions and may request supporting documents.

Contact: compliance@eazyride.com`,
    contentSo: `SIYAASADDA AML & KYC

Taariikhda: May 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD

1. UJEEDDO
Siyaasadkan waxay qeexaysaa ballanqaadka EazyRide-Haye! ka hortagga dhacdada lacag-dhaqashada, maalgelinta argagixiso, iyo khiyaano.

2. SHARCIGA
- Dhammaan EVC/Zaad lacag-bixintu way ka dhacdaa WaafiPay oo leh AML/KYC siyaasaddeeda
- Barxaddu way raacdaa shuruudda WaafiPay

3. KYC
Darawalku waa kuwa u muhiimsan KYC:
- Magaca, telefoon (OTP), shatiga, lambarka looxa, lacag-bixinta
- Admin waa xaqiijiyaa oo ogolaanayaa
- KYC records waa la hayaa 2 sano kadib xirmida

4. KORMEERKA LACAG-BIXINTA
Barxaddu way kormeeraysaa:
- Safarro/dalbashado aad u badan
- Wallet top-up aan la filan
- Burburin badan oo lacag-celinta la dalbado

5. FALSADDA LA ARKO
Waa la wargelinayaa WaafiPay. Koontadu way jabi karaan.

6. XAQIIJINTA
Marka macaamil la xiriirto taageerada, shaqaaluhu way weydiiyaan su'aalaha xaqiijinta.

La xiriir: compliance@eazyride.com`,
    contentAr: `سياسة مكافحة غسل الأموال ومعرفة العميل

تاريخ السريان: مايو 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD

1. الغرض
تحدد هذه السياسة التزام المنصة بمنع غسل الأموال وتمويل الإرهاب والاحتيال.

2. الإطار التنظيمي
- جميع معاملات EVC/Zaad تتم عبر WaafiPay التي لديها سياسات AML/KYC الخاصة
- المنصة تلتزم بشروط WaafiPay

3. إجراءات KYC
السائقون هم الفئة الرئيسية الخاضعة للتحقق:
- الاسم، الهاتف (OTP)، الرخصة، رقم اللوحة
- المشرف يراجع ويوافق على جميع التسجيلات

4. مراقبة المعاملات
المنصة تراقب أنماط غسل الأموال والاحتيال المحتمل.

5. النشاط المشبوه
يُبلغ فريق امتثال WaafiPay. قد تُعلق الحسابات.

6. التحقق من الهوية
عند اتصال العملاء بالدعم، يطرح الموظفون أسئلة تحقق.

تواصل: compliance@eazyride.com`,
  },
  {
    id: 'databreach',
    icon: <AlertTriangle className="w-5 h-5" />,
    titleKey: 'legal.docs.databreach',
    contentEn: `DATA BREACH NOTIFICATION POLICY

Effective Date: May 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD
Operating Region: Somalia

1. COMMITMENT
All affected users will be notified within 48 hours of discovering any data breach.

2. WHAT WE NOTIFY YOU ABOUT
For every breach classified as Critical, High, or Medium:
- What happened — clear description of the breach
- What data was affected — specific categories compromised
- What we are doing about it — remediation steps
- What you can do — recommended protective actions
- How to contact us — support channels

3. DATA CATEGORIES AT RISK
- Phone number → Spam, phishing risk
- Name and email → Identity risk
- Password (hashed) → Account takeover risk
- Driver's license → Identity theft risk
- Payment/EVC data → Financial fraud risk
- GPS location → Physical safety risk
- Wallet balance → Financial risk

4. NOTIFICATION METHOD
- In-app notification (all breaches)
- SMS (Critical and High)
- Email (Critical and High)
- Platform-wide banner (affects >500 users)

5. REMEDIATION
- Fix the vulnerability
- Force password resets for affected accounts
- Audit and revoke unauthorized access
- Provide recovery support to affected users

6. COORDINATION
- WaafiPay notified within 24 hours if payment data involved
- Government authorities notified as required by law
- Breach records retained for 5 years

Contact: security@eazyride.com`,
    contentSo: `SIYAASADDA OGEYSIISKA XADGUDUBKA XOGTA

Taariikhda: May 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD

1. BALLANQAAD
Dhammaan isticmaaleyasha saameysay way la ogeysiin doonaan 48 saac gudihi marka xadgudub xog la ogaado.

2. WAXAAN KU OGEYSIINNO
- Waa maxay dhacdada
- Xogta saameysay
- Waxaan samaynayno
- Waxaad samayn kartid
- Sidii aad nagu la xiriiri lahayd

3. NOOCA XOGTA KHATAR KU JIRA
- Telefoon → Khatar spam
- Magaca/email → Khatar aqoonsi
- Password → Khatar koontada
- Shatiga → Khatar xado
- Lacag-bixinta → Khatar lacag
- GPS → Khatar ammaan jidhka

4. HABKA OGEYSIISKA
- App guda (dhammaan)
- SMS (Critical iyo High)
- Email (Critical iyo High)

5. HAGAAJINTA
- Beddel dhaawaca
- Password-ka reset
- Xaqiiji iyo jabi gelitaan

6. ISKU XIDHKA
- WaafiPay 24 saac haddii lacag la saameeyay
- Xukuumad sida sharcigu yidhaahdo

La xiriir: security@eazyride.com`,
    contentAr: `سياسة إخطار خرق البيانات

تاريخ السريان: مايو 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD

1. الالتزام
يتم إخطار جميع المستخدمين المتأثرين خلال 48 ساعة من اكتشاف أي خرق للبيانات.

2. ما نخطر به
- ماذا حدث — وصف واضح
- البيانات المتأثرة — الفئات المحددة
- ماذا نفعل — خطوات المعالجة
- ماذا يمكنك أن تفعل — إجراءات الحماية

3. فئات البيانات المعرضة للخطر
- رقم الهاتف → خطر الرسائل المزعجة
- الاسم/البريد → خطر الهوية
- كلمة المرور → خطر اختراق الحساب
- الرخصة → خطر سرقة الهوية
- بيانات الدفع → خطر احتيال مالي
- GPS → خطر السلامة الجسدية

4. طريقة الإخطار
- إشعار في التطبيق (جميع الخروقات)
- SMS (حرجة وعالية)
- بريد إلكتروني (حرجة وعالية)

5. المعالجة
- إصلاح الثغرة
- إعادة تعيين كلمات المرور
- مراجعة وإلغاء الوصول غير المصرح به

6. التنسيق
- إخطار WaafiPay خلال 24 ساعة إذا تضمنت بيانات الدفع
- إخطار السلطات الحكومية حسب القانون

تواصل: security@eazyride.com`,
  },
  {
    id: 'eula',
    icon: <FileText className="w-5 h-5" />,
    titleKey: 'legal.docs.eula',
    contentEn: `END-USER LICENSE AGREEMENT (EULA)

Effective Date: April 2026 | Last Updated: May 4, 2026
Between: BinMahfuud LTD, operating as EazyRide-Haye! and You
Distribution: Google Play Store, Apple App Store

1. LICENSE GRANT
BinMahfuud LTD grants you a limited, non-exclusive, non-transferable, revocable license to download and use the App for its intended purposes.

2. LICENSE RESTRICTIONS
You must not: reverse engineer, modify, distribute, circumvent protections, remove proprietary notices, access APIs with automated tools, or interfere with infrastructure.

3. OWNERSHIP
All software, source code, trademarks, and documentation are the exclusive property of BinMahfuud LTD.

4. OPEN SOURCE SOFTWARE
The App uses: OpenStreetMap/Nominatim (ODbL 1.0), OSRM (BSD 2-Clause), React Native & Expo (MIT), Node.js & Express (MIT), Socket.io (MIT).

5. DISCLAIMER OF WARRANTIES
THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE". No warranties of merchantability, fitness, non-infringement, accuracy, or availability.

6. LIMITATION OF LIABILITY
Total liability shall not exceed fees paid in 12 months preceding claim or $100 USD, whichever is greater.

7. APP STORE TERMS
Google Play: Google is not a party to this EULA. Apple: Apple is not a party and has no warranty obligation.

8. GOVERNING LAW
Laws of the Federal Republic of Somalia.

Contact: legal@eazyride.com`,
    contentSo: `HESHIISKA LISENSKA ISTICMAALE-DHAMMAAD (EULA)

Taariikhda: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Dhexe: BinMahfuud LTD, oo shaqeynaysa EazyRide-Haye! iyo Adiga

1. LISENSKA
BinMahfuud LTD way siiyaan lisenska xadidan, aan kala iibsadan, aan la wareejin karin.

2. XADIDKA LISENSKA
Ha: reverse engineer, ha beddel, ha wadaag, ha dhexgeli.

3. MILKIILKA
Dhammaan softweerka, source code-ka, sumadaha waa milkiilka BinMahfuud LTD.

4. SOFTWEERKA FURAN
App-ku wuxuu isticmaalaa: OpenStreetMap, OSRM, React Native, Expo, Node.js, Socket.io.

5. WAANO LISENSKA
APP-KU WAA "SIDA UU YAHAY". Ma jiraan waano.

6. XADIDKA MAS'UULIYADDA
Mas'uuliyaddu way ka yaraan doontaa lacag la bixiyay 12 bilood.

7. SHURUUDDA APP STORE
Google iyo Apple ma aha wada shaqeynayaal.

8. SHARCIGA
Sharciga Soomaaliya.

La xiriir: legal@eazyride.com`,
    contentAr: `اتفاقية ترخيص المستخدم النهائي (EULA)

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
بين: BinMahfuud LTD، تعمل باسم إيزي رايد-هاي! وأنت

1. الترخيص
منح BinMahfuud LTD ترخيصاً محدوداً غير حصري غير قابل للتحويل.

2. قيود الترخيص
لا: هندسة عكسية، تعديل، توزيع، التحايل على الحماية.

3. الملكية
جميع البرمجيات والعلامات التجارية ملكية حصرية لـ BinMahfuud LTD.

4. البرمجيات مفتوحة المصدر
التطبيق يستخدم: OpenStreetMap, OSRM, React Native, Expo, Node.js, Socket.io.

5. إخلاء المسؤولية
التطبيق مقدم "كما هو" و"حسب التوفر". لا ضمانات.

6. حدود المسؤولية
المسؤولية لا تتجاوز الرسوم المدفوعة خلال 12 شهراً.

7. شروط متجر التطبيقات
Google و Apple ليسا طرفاً في هذه الاتفاقية.

8. القانون الحاكم
قوانين الصومال.

تواصل: legal@eazyride.com`,
  },
  {
    id: 'dpa',
    icon: <Database className="w-5 h-5" />,
    titleKey: 'legal.docs.dpa',
    contentEn: `DATA PROCESSING AGREEMENT (DPA)

Effective Date: April 2026 | Last Updated: May 4, 2026
Between: BinMahfuud LTD, operating as EazyRide-Haye! and Data Processors
Owned By: BinMahfuud LTD

DATA PROCESSORS:
1. WaafiPay (Payment Processing) — EVC phone, transaction amounts, user ID
2. Cloud Infrastructure — All Platform data in PostgreSQL and Redis
3. Expo Push Notifications — Push tokens, notification content
4. OSRM (Routing) — Pickup/dropoff coordinates only (ephemeral)
5. Nominatim (Geocoding) — Search query text only

KEY OBLIGATIONS:
- Processors process data only on documented instructions from BinMahfuud LTD
- Data minimization: Only necessary data per purpose
- Security: Encryption, access control, audit trails
- Sub-processors: 30 days advance notice before changes
- Data subject rights: Assist within 10 business days
- Security incidents: Notify within 48 hours of discovery
- Data retention: Per schedule; deletion within 30 days of termination
- Audit rights: BinMahfuud LTD may audit with 30 days notice

Contact: privacy@eazyride.com`,
    contentSo: `HESHIISKA HABAYNTA XOGTA (DPA)

Taariikhda: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Dhexe: BinMahfuud LTD, oo shaqeynaysa EazyRide-Haye! iyo Habaynayaasha Xogta
Leh: BinMahfuud LTD

HABAYNAYAASHA XOGTA:
1. WaafiPay — Telefoon EVC, qiimaha, user ID
2. Cloud Infrastructure — Dhammaan xogta barxadda
3. Expo Push — Tokens, content-ka
4. OSRM — Coordinates kaliya
5. Nominatim — Qoraalka raadinta kaliya

Contact: privacy@eazyride.com`,
    contentAr: `اتفاقية معالجة البيانات (DPA)

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
بين: BinMahfuud LTD، تعمل باسم إيزي رايد-هاي! ومعالجي البيانات
مملوكة لـ: BinMahfuud LTD

معالجو البيانات:
1. WaafiPay — هاتف EVC، المبلغ، معرف المستخدم
2. البنية السحابية — جميع بيانات المنصة
3. إشعارات Expo — الرموز، المحتوى
4. OSRM — الإحداثيات فقط
5. Nominatim — نص البحث فقط

تواصل: privacy@eazyride.com`,
  },
  {
    id: 'dispute',
    icon: <Gavel className="w-5 h-5" />,
    titleKey: 'legal.docs.dispute',
    contentEn: `DISPUTE RESOLUTION & ESCALATION POLICY

Effective Date: April 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD

ESCALATION TIERS:
Tier 1 — Self-Service & Automated (Immediate to 24 hours)
- Auto-refund for duplicates, overcharges, cancelled rides
- In-app reporting tools

Tier 2 — Platform Support Review (1-3 business days)
- CARE agents review evidence: GPS data, ride logs, transactions
- Can issue refunds, warnings, service credits
- Cannot suspend/deactivate accounts

Tier 3 — Senior Review & Manager Escalation (3-7 business days)
- MANAGER-level admin reviews independently
- Can suspend/deactivate, adjust commissions, release escrow
- Final Platform decision

SAFETY INCIDENTS: Skip to Tier 3 immediately
- SOS alerts treated as critical priority
- Investigation within 7 days
- Confirmed violation: Permanent deactivation

ARBITRATION:
- For claims >$500 USD or denied deactivation appeals
- Binding arbitration in Somalia
- Language: English or Somali
- Each party bears own costs
- Criminal matters exempt from arbitration

STATUTE OF LIMITATIONS: 1 year from dispute date

Contact by Tier:
Tier 1: support@eazyride.com | Tier 2: support@eazyride.com | Tier 3: disputes@eazyride.com | Safety: safety@eazyride.com`,
    contentSo: `SIYAASADDA XALKA MURANKA & KOR U QAADISTA

Taariikhda: Abriil 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD

HEERARKA KOR U QAADISTA:
Heerka 1 — Adeeg Iskood & Otomaatiko (Degdeg ilaa 24 saac)
- Auto-lacag-celinta

Heerka 2 — Taageerada Barxadda (1-3 maalin shaqo)
- CARE agents way fiiriyaan

Heerka 3 — Taageerada Sare (3-7 maalin shaqo)
- MANAGER way go'aaminayaan
- Go'aankii u danbeeyaa

KHATARTA AMMAANKA: Heerka 3 la boodo
- SOS waa muhiimad sare
- Xirid da'en haddii la xaqiijiyo

ARBITRATION:
- $500 USD ka badan ama xirmid la diiday
- Somalia la xaliyaa
- 1 sano waqti xad

La xiriir: support@eazyride.com | disputes@eazyride.com | safety@eazyride.com`,
    contentAr: `سياسة حل النزاعات والتصعيد

تاريخ السريان: أبريل 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD

مستويات التصعيد:
المستوى 1 — ذاتي وتلقائي (فوري إلى 24 ساعة)

المستوى 2 — مراجعة دعم المنصة (1-3 أيام عمل)

المستوى 3 — مراجعة عليا (3-7 أيام عمل)
- قرار المنصة النهائي

حالات السلامة: انتقل للمستوى 3 فوراً

التحكيم:
- للمطالبات >500 دولار أمريكي
- تحكيم ملزم في الصومال
- تقادم: سنة واحدة

تواصل: support@eazyride.com | disputes@eazyride.com | safety@eazyride.com`,
  },
  {
    id: 'admin',
    icon: <Lock className="w-5 h-5" />,
    titleKey: 'legal.docs.admin',
    contentEn: `ADMIN & STAFF CONFIDENTIALITY AND ACCESS AGREEMENT

Effective Date: May 2026 | Last Updated: May 4, 2026
Between: BinMahfuud LTD, operating as EazyRide-Haye! and You
Applicable To: SUPER_ADMIN, MANAGER, and CARE Agent roles

1. CONFIDENTIALITY
- Staff must NOT share any user data with external parties
- Exception: Written request from governing agencies (municipality, police, courts)
- Only SUPER_ADMIN or MANAGER may authorize data release for government requests
- All government data requests must be documented in audit log

2. IDENTITY VERIFICATION FOR SUPPORT
When a client calls to update their profile:
- Ask verification questions (name, phone, recent rides)
- Request supporting documents for sensitive changes (payout method, license)
- OTP confirmation for email/payout changes
- Document all verification steps

3. ACCESS CONTROLS
- SUPER_ADMIN: Full system access
- MANAGER: Operational data, disputes, escalated cases
- CARE Agent: Support tools, basic user info, issue resolution
- All admin actions logged in audit trail

4. PROHIBITED ACTIONS
- Accessing user data for personal curiosity
- Sharing data on social media or external platforms
- Modifying financial records without authorization
- Accepting bribes for preferential treatment

5. CONSEQUENCES
- Minor violation: Written warning + re-training
- Serious violation: Immediate termination
- Criminal activity: Report to law enforcement

Contact: admin@eazyride.com | Security: security@eazyride.com`,
    contentSo: `HESHIISKA SIRRKA & GELITAANKA MAMNUCA & SHAQAALAHAA

Taariikhda: May 2026 | La Cusboonaysiiyay: May 4, 2026
Dhexe: BinMahfuud LTD, oo shaqeynaysa EazyRide-Haye! iyo Adiga
Ku Sofdee: SUPER_ADMIN, MANAGER, iyo CARE Agent

1. SIRRKA
- Shaqaaluhu MA wadaagi karaan xogta isticmaaleyasha dibadda
- U keeno: Qoraal xukuumad (degmo, boolis, maxkamad)
- SUPER_ADMIN ama MANAGER kaliya ayaa ogolaan kara
- Dhammaan codsashada xukuumad waa la diiwaangashaa

2. XAQIIJINTA TAAGEERADA
Marka macaamil la xiriirto:
- Way weydiiyaan su'aalaha xaqiijinta
- Way dalbaan documents dareen leh
- OTP confirmation
- Dhammaan waa la diiwaangashaa

3. XAKAALKA GELITAANKA
- SUPER_ADMIN: Dhammaan
- MANAGER: Hawl-galka, murannada
- CARE Agent: Taageero, macluumaad aasaasi

4. FALDHA MAMNUCA
- Xogta shaqsi ahaan fiirid
- Wadaagista social media
- Bedel diiwaannada lacag aan ogolaansho lahayn
- Rashin

5. CILADHA
- Yar: Digniin + tababar
- Weyn: Joojinta degdeg ah
- Jinay: Waran boolis

La xiriir: admin@eazyride.com | security@eazyride.com`,
    contentAr: `اتفاقية سرية وصول المشرفين والموظفين

تاريخ السريان: مايو 2026 | آخر تحديث: 4 مايو 2026
بين: BinMahfuud LTD، تعمل باسم إيزي رايد-هاي! وأنت

1. السرية
- لا يشارك الموظفون بيانات المستخدمين مع أطراف خارجية
- استثناء: طلب كتابي من وكالات حكومية
- SUPER_ADMIN أو MANAGER فقط يصرحان بالإفراج عن البيانات

2. التحقق من الهوية للدعم
- طرح أسئلة التحقق
- طلب مستندات داعمة للتغييرات الحساسة
- تأكيد OTP

3. ضوابط الوصول
- SUPER_ADMIN: وصول كامل
- MANAGER: البيانات التشغيلية والنزاعات
- CARE Agent: أدوات الدعم والمعلومات الأساسية

4. الإجراءات المحظورة
- الوصول الشخصي للبيانات
- مشاركة البيانات على وسائل التواصل
- تعديل السجلات المالية بدون تصريح

5. العواقب
- بسيطة: تحذير + إعادة تدريب
- خطيرة: إنهاء فوري
- جنائية: إبلاغ إنفاذ القانون

تواصل: admin@eazyride.com | security@eazyride.com`,
  },
  {
    id: 'forcemajeure',
    icon: <AlertTriangle className="w-5 h-5" />,
    titleKey: 'legal.docs.forcemajeure',
    contentEn: `FORCE MAJEURE POLICY

Effective Date: May 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD

1. DEFINITION
Extraordinary events beyond reasonable control that prevent or impair Platform operations.

2. FORCE MAJEURE EVENTS
- Natural: Earthquakes, floods, severe storms, epidemics, pandemics
- Conflict: Armed conflict, civil unrest, terrorism, curfews, security incidents
- Government: Changes in law, movement restrictions, telecom shutdowns
- Infrastructure: Internet/mobile outages >4 hours, WaafiPay outages >4 hours, cloud failures
- Other: Any event beyond reasonable control

3. EFFECTS
- Platform may suspend services in affected areas
- Users are not penalized for declining services during events
- Full refunds for cancelled rides/orders/reservations
- Commission charges waived for cancelled transactions

4. CONFLICT AND SECURITY PROTOCOL
- Safety-first: Services may be suspended in areas with active threats
- SOS system and safety team monitor for security threats
- Platform cooperates with local authorities during security events
- User data shared with governing agencies only upon written request

5. DURATION
- Force majeure relief applies for event duration + reasonable recovery period
- If event continues >30 consecutive days, either party may terminate with 7 days notice

Contact: support@eazyride.com`,
    contentSo: `SIYAASADDA HAWL-QALADKA

Taariikhda: May 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD

1. QEEYBTA
Dhacdooyin aan la saameyn karin ka hortagga hawlgalka barxadda.

2. DHACDOOYINKA HAWL-QALADKA
- Dabiici: Dhul-gariir, daad, daalin, cudurro faafa
- Col: Dagaal, khilaf, argagixiso, hurdo, ammaan
- Xukuumad: Sharci isbeddel, xadid dhaqaaq, telecom jab
- Infrastructure: Internet/mobile jab >4 saac, WaafiPay jab, cloud jab

3. SAAMEYNTA
- Barxaddu way jabi kartaa adeegyada aagga saameysay
- Isticmaaleyasha lama ciqaabi karo waqtiga dhacdada
- Lacag-celis buuxda

4. HABKA AMMAANKA IYO COL-GA
- Ammaan hore: Adeegyada way jabi karaan
- SOS way kormeeraysaa khataraha
- Xogta isticmaaleyasha la wadaag xukuumad qoraal kaliya

5. WAKHTIGA
- >30 maalin: Waa la jabin karaa 7 maalin ogolaansho

La xiriir: support@eazyride.com`,
    contentAr: `سياسة القوة القاهرة

تاريخ السريان: مايو 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD

1. التعريف
أحداث استثنائية خارج السيطلة المعقولة تعوق تشغيل المنصة.

2. أحداث القوة القاهرة
- طبيعية: زلازل، فيضانات، أوبئة
- صراع: نزاع مسلح، اضطرابات، إرهاب، حظر تجول
- حكومية: تغييرات قانونية، قيود حركة، انقطاع اتصالات
- بنية تحتية: انقطاع إنترنت/جوال >4 ساعات

3. الآثار
- قد تعلق المنصة الخدمات في المناطق المتأثرة
- لا يعاقب المستخدمون أثناء الحدث
- استرداد كامل للرحلات/الطلبات الملغاة

4. بروتوكول الأمن والصراع
- السلامة أولاً: قد تُعلق الخدمات
- التعاون مع السلطات المحلية
- مشاركة البيانات مع الوكالات الحكومية بطلب كتابي فقط

5. المدة
- >30 يوماً متتالياً: يمكن لأي طرف الإنهاء بإشعار 7 أيام

تواصل: support@eazyride.com`,
  },
  {
    id: 'aup',
    icon: <Scale className="w-5 h-5" />,
    titleKey: 'legal.docs.aup',
    contentEn: `ACCEPTABLE USE POLICY

Effective Date: May 2026 | Last Updated: May 4, 2026
Owned By: BinMahfuud LTD

1. PROHIBITED ACTIVITIES
- Fraud: Fake accounts, GPS manipulation, false refund claims, fake documents
- Payment evasion: Off-platform solicitation, cash to bypass payments, chargebacks on legitimate transactions
- Platform interference: Reverse engineering, unauthorized API access, DDoS, uploading malware
- Harassment: Threats, abuse, discrimination, sexual harassment, weapons
- Misuse: Inappropriate messaging, sharing user info, false SOS reports, exploiting glitches

2. INTELLECTUAL PROPERTY
- EazyRide and Haye! names, logos, and branding are exclusive property of BinMahfuud LTD
- Copyright infringement: Report to legal@eazyride.com with description, URL, and contact info

3. ENFORCEMENT
- Critical: Permanent deactivation + report to authorities
- Major: 30-90 day suspension + re-approval
- Moderate: Warning + improvement plan
- Minor: Quality warning + coaching

4. APPEALS
All enforcement actions may be appealed within 14 days to support@eazyride.com.

Contact: support@eazyride.com | Safety: safety@eazyride.com | IP: legal@eazyride.com`,
    contentSo: `SIYAASADDA ISTICMAALKA LAGA OGOL YAHAY

Taariikhda: May 2026 | La Cusboonaysiiyay: May 4, 2026
Leh: BinMahfuud LTD

1. FALDHA MAMNUCA
- Falsad: Koonto beenta, GPS manipulation, lacag-celinta beenta
- Ilbiidsi lacag: Dalbo dibadda, cash, chargeback khaldan
- Dhexgelinta barxadda: Reverse engineering, API aan ogolaansho lahayn
- Caydin: Cabsi, xadgudub, cudur-darad, xadgudubka jinsi
- Khalad: Farriin khaldan, wadaag xog, SOS beenta

2. MILKIILKA FIKRADA
- EazyRide iyo Haye! waa milkiilka BinMahfuud LTD
- Xadgudubka sharciga: legal@eazyride.com

3. QAAB-DHAQANKA
- Critical: Xirid da'en + waran xukuumad
- Major: Jabin 30-90 maalin
- Moderate: Digniin + qorshe
- Minor: Digniin tayo

4. RAYN
14 maalin ayaad rayn kartaa.

La xiriir: support@eazyride.com | safety@eazyride.com | legal@eazyride.com`,
    contentAr: `سياسة الاستخدام المقبول

تاريخ السريان: مايو 2026 | آخر تحديث: 4 مايو 2026
مملوكة لـ: BinMahfuud LTD

1. الأنشطة المحظورة
- الاحتيال: حسابات مزيفة، التلاعب بـ GPS، ادعاءات استرداد كاذبة
- التهرب من الدفع: طلب خارج المنصة، نقدي، رفض عكسي غير مبرر
- التدخل: هندسة عكسية، وصول API غير مصرح
- التحرش: تهديدات، إساءة، تمييز
- سوء الاستخدام: رسائل غير لائقة، مشاركة بيانات مستخدم

2. الملكية الفكرية
- أسماء وشعارات إيزي رايد وهاي! ملكية حصرية لـ BinMahfuud LTD
- انتهاك حقوق النشر: legal@eazyride.com

3. الإنفاذ
- حرج: إلغاء دائم + إبلاغ السلطات
- كبير: تعليق 30-90 يوماً
- متوسط: تحذير + خطة تحسين
- بسيط: تحذير جودة

4. الاستئناف
14 يوماً للاستئناف.

تواصل: support@eazyride.com | safety@eazyride.com | legal@eazyride.com`,
  },
];

export default function LegalPage({ open, onClose, initialDoc }: { open: boolean; onClose: () => void; initialDoc?: string }) {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'so' | 'ar';
  const [activeDoc, setActiveDoc] = useState(initialDoc || 'terms');

  const title = lang === 'ar' ? 'المستندات القانونية' : lang === 'so' ? 'Warqadaha Sharciga' : 'Legal Documents';
  const closeText = lang === 'ar' ? 'إغلاق' : lang === 'so' ? 'Xir' : 'Close';
  const ownedByText = lang === 'ar' ? 'مملوكة لـ BinMahfuud LTD — جميع الحقوق محفوظة' : lang === 'so' ? 'Leh BinMahfuud LTD — Dhammaan xaquuqda waa la ilaalay' : 'Owned by BinMahfuud LTD — All rights reserved';

  const getContent = (doc: LegalDoc) => {
    if (lang === 'ar') return doc.contentAr;
    if (lang === 'so') return doc.contentSo;
    return doc.contentEn;
  };

  const doc = LEGAL_DOCS.find(d => d.id === activeDoc) || LEGAL_DOCS[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-navy-800 border border-navy-500/60 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Sidebar */}
            <div className="md:w-64 lg:w-72 bg-navy-900 border-b md:border-b-0 md:border-l md:border-r-0 border-navy-500/40 overflow-y-auto p-4 shrink-0" style={{ borderInlineEnd: lang === 'ar' ? 'none' : undefined, borderInlineStart: lang === 'ar' ? '1px solid rgba(45,59,94,0.4)' : undefined }}>
              <h2 className="text-lg font-bold text-gold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5" /> {title}
              </h2>
              <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
                {LEGAL_DOCS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setActiveDoc(d.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      activeDoc === d.id
                        ? 'bg-gold/20 text-gold border border-gold/40'
                        : 'text-gray-400 hover:text-white hover:bg-navy-700/60 border border-transparent'
                    }`}
                  >
                    {d.icon}
                    <span className="hidden lg:inline">{(d.titleKey.split('.').pop() || '').charAt(0).toUpperCase() + (d.titleKey.split('.').pop() || '').slice(1)}</span>
                    <span className="lg:hidden">{(d.titleKey.split('.').pop() || '').charAt(0).toUpperCase() + (d.titleKey.split('.').pop() || '').slice(1)}</span>
                    {activeDoc === d.id && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
                  </button>
                ))}
              </nav>
              <p className="text-xs text-gray-500 mt-4 hidden md:block">{ownedByText}</p>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-navy-500/40">
                <h3 className="text-xl font-bold text-gold flex items-center gap-2">
                  {doc.icon} {(doc.titleKey.split('.').pop() || '').charAt(0).toUpperCase() + (doc.titleKey.split('.').pop() || '').slice(1)}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gold transition-colors cursor-pointer p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {getContent(doc)}
                </pre>
              </div>
              <div className="p-4 border-t border-navy-500/40 flex items-center justify-between">
                <p className="text-xs text-gray-500">{ownedByText}</p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-gold to-copper text-navy-900 font-bold py-2 px-6 rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
                >
                  {closeText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
