import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      heroTitle: 'EazyRide + Haye!',
      heroSub: 'Fast & Safe Rides • Delicious Food • Reliable Cars',
      ctaRide: 'Request Ride',
      ctaFood: 'Order Food',
      ctaCars: 'Rent Car',
      services: {
        title: 'Our Services',
        eazyride: 'EazyRide: Rides & Food Delivery',
        haye: 'Haye! Services',
        desc1: 'Real-time Bajaj rides in Laascaanood.',
        desc2: 'Fresh meals delivered fast.',
        desc3: 'Rent a car · Request water · Request handyman · Post your service free',
      },
      downloads: {
        title: 'Download Now (Android)',
        rider: 'Rider App',
        driver: 'Driver App',
        store: 'Store Owner',
        provider: 'Provider App'
      },
      terms: {
        agree: 'I agree to the',
        link: 'Terms & Conditions',
        mustAgree: 'Please agree to the Terms & Conditions before downloading.'
      },
      switchEn: 'English',
      switchSo: 'Soomaali',
      switchAr: 'العربية',
      footer: {
        legal: 'Legal',
        terms: 'Terms & Conditions',
        privacy: 'Privacy Policy',
        rider: 'Rider Agreement',
        driver: 'Driver Agreement',
        restaurant: 'Restaurant Agreement',
        carrental: 'Car Rental Terms',
        community: 'Community Guidelines',
        refund: 'Refund Policy',
        aml: 'AML & KYC',
        databreach: 'Data Breach Policy',
        eula: 'EULA',
        dpa: 'Data Processing',
        dispute: 'Dispute Resolution',
        admin: 'Admin Agreement',
        forcemajeure: 'Force Majeure',
        aup: 'Acceptable Use',
        copyright: '© 2026 BinMahfuud LTD. All rights reserved.',
        operated: 'EazyRide + Haye! is operated by BinMahfuud LTD.',
        madeIn: 'Made in Somalia 🇸🇴'
      },
      benefits: {
        title: 'Who Benefits and How',
        rider: {
          who: 'Rider App — The Customer',
          for: 'Everyday people in Laascaanood who need transport, food, or a car.',
          benefits: [
            'Rides — Bajaj pickup in minutes, real-time GPS tracking, fair pricing',
            'Food delivery — Order from local restaurants with delivery tracking',
            'Car rental — Hourly/daily cars with escrow protection',
            'Lottery — Enter prize draws while using the app',
            'SOS alerts — One-tap emergency alert with location',
            'Chat — Directly message driver during ride',
            'EVC/Zaad payments — Pay with Somali mobile money',
            'Real-time tracking — Watch driver approach on map live'
          ]
        },
        driver: {
          who: 'Driver App — The Earner',
          for: 'Drivers with Bajajs, motorcycles, or cars who want to earn.',
          benefits: [
            'Dual earnings — Accept ride requests AND food delivery orders',
            'Real-time location — Gets shown to riders so pickups are smooth',
            'Chat — Coordinate with riders without phone calls',
            'Commission system — Transparent split of fare, automatic payouts',
            'Driver dashboard — Track ratings, total rides, earnings history',
            'Online toggle — Go online/offline when you want'
          ]
        },
        store: {
          who: 'Store Owner App — The Restaurateur',
          for: 'Restaurant and shop owners who want to reach more customers.',
          benefits: [
            'Order management — Accept and manage delivery orders in real-time',
            'Menu dashboard — Update items, prices, and availability instantly',
            'Revenue tracking — See daily/weekly earnings and analytics',
            'Customer reach — Get discovered by thousands of nearby riders',
            'Promotions — Run deals and discounts to boost sales'
          ]
        },
        provider: {
          who: 'Provider App — The Fleet Manager',
          for: 'Car rental providers who manage fleets and want transparent operations.',
          benefits: [
            'Fleet management — Add, track, and manage all your vehicles',
            'Escrow system — Secure deposits and payments with full transparency',
            'Booking dashboard — See all rental requests, active rentals, returns',
            'Revenue reports — Detailed breakdowns of income per vehicle',
            'Driver verification — Vett and approve drivers before rental'
          ]
        },
        table: {
          app: 'App',
          who: 'Who',
          mainBenefit: 'Main Benefit',
          riderApp: 'Rider',
          riderWho: 'Customer',
          riderBenefit: 'Everything on-demand, safe & local',
          driverApp: 'Driver',
          driverWho: 'Earner',
          driverBenefit: 'Dual income from rides & deliveries',
          storeApp: 'Store',
          storeWho: 'Restaurateur',
          storeBenefit: 'Reach thousands of new customers',
          providerApp: 'Provider',
          providerWho: 'Fleet Manager',
          providerBenefit: 'Transparent fleet & escrow management'
        }
      }
    }
  },
  so: {
    translation: {
      heroTitle: 'EazyRide + Haye!',
      heroSub: 'Raac Degdeg ah & Ammaan ah • Cunto Dhadhamin leh • Gaadiid La Aamini karo',
      ctaRide: 'Raac Dalbo',
      ctaFood: 'Cunto Dalbo',
      ctaCars: 'Gaadiid Kireys Ash',
      services: {
        title: 'Adeegyadayada',
        eazyride: 'EazyRide: Raacyada & Gaadiidka Cunnada',
        haye: 'Haye! Adeegyada',
        desc1: 'Raac Bajaj ee Laascaanood ee wakhtiga dhabta ah.',
        desc2: 'Cunto cusub oo degdeg loo keenayo.',
        desc3: 'Kiree gaari · Dalbi biyo · Dalbi farsamo · Ku daar adeeggaaga bilaash',
      },
      downloads: {
        title: 'Hadda Soo Degso (Android)',
        rider: 'App Rider',
        driver: 'App Driver',
        store: 'Mulkiilaha Dukaan',
        provider: 'Bixiyaha Adeeg'
      },
      terms: {
        agree: 'Waan ogolahay',
        link: "Shuruudaha & Qaa'dada",
        mustAgree: 'Fadlan ogow shuruudaha ka hor soo dejinta.'
      },
      switchEn: 'English',
      switchSo: 'Soomaali',
      switchAr: 'Carabi',
      footer: {
        legal: 'Sharciga',
        terms: "Shuruudaha & Qaa'dada",
        privacy: 'Astaanka Qarsoodiga',
        rider: 'Heshiiska Ridaaga',
        driver: 'Heshiiska Darawalka',
        restaurant: 'Heshiiska Maqaayadda',
        carrental: 'Shuruudda Kirada',
        community: 'Hagaagga Bulshada',
        refund: 'Siyaasadda Lacag-celinta',
        aml: 'AML & KYC',
        databreach: 'Siyaasadda Xadgudubka Xogta',
        eula: 'EULA',
        dpa: 'Habaynta Xogta',
        dispute: 'Xalka Muranka',
        admin: 'Heshiiska Mamnuc',
        forcemajeure: 'Hawl-qaladka',
        aup: 'Isticmaalka Lagu Ogol yahay',
        copyright: '© 2026 BinMahfuud LTD. Dhammaan xaquuqda waa la ilaalay.',
        operated: 'EazyRide + Haye! waxaa shaqeynaysa BinMahfuud LTD.',
        madeIn: 'Laga sameeyay Soomaaliya 🇸🇴'
      },
      benefits: {
        title: "Yaa Ka Faa'iidooda iyo Sida",
        rider: {
          who: 'App Rider — Macaamilka',
          for: 'Dadka maalinlaha ah ee Laascaanood ee u baahan gaadiid, cunto, ama gaari.',
          benefits: [
            'Raacyada — Bajaj lagu soo qaato daqiiqado gudahood, raad-raaca GPS, qiime cadaalad ah',
            'Gaadiidka Cunnada — Ka dalbo maqaayadaha maxalliga ah raad-raaca gaadiidka',
            'Kirada gaadiidka — Saac/galab gaari oo escrow ilaashado',
            'Labaad — Ka qaadso tartan halka aad app-ka isticmaalayso',
            'SOS — Hal taabo degdeg raad-raaca goobta',
            'Wada sheekasho — La wada sheeko darawalka safarka',
            'EVC/Zaad — Lacag bixi telefoon Soomaali',
            'Raad-raac wakhtiga dhabta — Daawo darawalka khariidada'
          ]
        },
        driver: {
          who: 'App Driver — Lacag-bixi',
          for: 'Darawal Bajaj, baaskil, ama gaari ee raba inay lacag bixdaan.',
          benefits: [
            'Laba dakhli — Raac iyo cunto labadaba',
            'Goobta wakhtiga dhabta — Ridaagu arkaa si ay u soo qaataan',
            'Wada sheekasho — La sheeko ridaaga telefoon la\'aan',
            'Komishan — Qaybsasho cadd, lacag-bixi otomaatiko',
            'Dashboard — Tirsi, safarro, dakhli',
            'Online toggle — Online/offline markaad rabto'
          ]
        },
        store: {
          who: 'App Mulkiilaha Dukaan — Maqaayad',
          for: 'Maqaayad iyo dukaan mulkiilayaal ee raba macaamil badan.',
          benefits: [
            'Maareyn dalbasho — Aqbi iyo maareyn wakhtiga dhabta',
            'Menu dashboard — Cunto, qiime, helitaan degdeg',
            'Dakhli — Maalinlaha/todobaadkiiga iyo analytics',
            'Macaamil — Kunan ridaag kuu soo dhow',
            'Dallac — Qiime yaraan iigo kordhi'
          ]
        },
        provider: {
          who: 'App Bixiyaha — Flit Manager',
          for: 'Bixiyayaasha kirada gaadiidka ee raba hawlo cadaalad.',
          benefits: [
            'Flit maareyn — Ku dar, raad, iyo maaree dhammaan gaadiidka',
            'Escrow — Deposit iyo lacag-bixin amaan',
            'Booking dashboard — Dalbasho, kirada firfircoon, celin',
            'Dakhli qor — Faahfaahin gaari gaari',
            'Darawal xaqiijin — Xaqiiji ka hor kirada'
          ]
        },
        table: {
          app: 'App',
          who: 'Yaa',
          mainBenefit: "Faa'iidada Guud",
          riderApp: 'Rider',
          riderWho: 'Macaamil',
          riderBenefit: 'Dhammaan dalbo, ammaan & maxalli',
          driverApp: 'Driver',
          driverWho: 'Lacag-bixi',
          driverBenefit: 'Laba dakhli safar & gaadiid',
          storeApp: 'Dukaan',
          storeWho: 'Maqaayad',
          storeBenefit: 'Kunan macaamil cusub',
          providerApp: 'Bixiyaha',
          providerWho: 'Flit Manager',
          providerBenefit: 'Maareyn flit & escrow cad'
        }
      }
    }
  },
  ar: {
    translation: {
      heroTitle: 'إيزي رايد + هاي!',
      heroSub: 'رحلات سريعة وآمنة • طعام لذيذ • سيارات موثوقة',
      ctaRide: 'طلب رحلة',
      ctaFood: 'طلب طعام',
      ctaCars: 'استئجار سيارة',
      services: {
        title: 'خدماتنا',
        eazyride: 'إيزي رايد: رحلات وتوصيل طعام',
        haye: 'هاي! خدمات',
        desc1: 'رحلات باچاج فورية في لاسعانود.',
        desc2: 'وجبات طازجة سريعة التوصيل.',
        desc3: 'استأجر سيارة · اطلب ماء · اطلب حرفي · أعلن عن خدمتك مجانا',
      },
      downloads: {
        title: 'حمل الآن (أندرويد)',
        rider: 'تطبيق الراكب',
        driver: 'تطبيق السائق',
        store: 'مالك المتجر',
        provider: 'مزود الخدمة'
      },
      terms: {
        agree: 'أوافق على',
        link: 'الشروط والأحكام',
        mustAgree: 'يرجى الموافقة على الشروط والأحكام قبل التحميل.'
      },
      switchEn: 'English',
      switchSo: 'الصومالية',
      switchAr: 'العربية',
      footer: {
        legal: 'قانوني',
        terms: 'الشروط والأحكام',
        privacy: 'سياسة الخصوصية',
        rider: 'اتفاقية الراكب',
        driver: 'اتفاقية السائق',
        restaurant: 'اتفاقية المطعم',
        carrental: 'شروط الإيجار',
        community: 'إرشادات المجتمع',
        refund: 'سياسة الاسترداد',
        aml: 'مكافحة غسل الأموال',
        databreach: 'سياسة خرق البيانات',
        eula: 'اتفاقية الترخيص',
        dpa: 'معالجة البيانات',
        dispute: 'حل النزاعات',
        admin: 'اتفاقية المشرفين',
        forcemajeure: 'القوة القاهرة',
        aup: 'الاستخدام المقبول',
        copyright: '© 2026 BinMahfuud LTD. جميع الحقوق محفوظة.',
        operated: 'إيزي رايد + هاي! تديرها BinMahfuud LTD.',
        madeIn: 'صنع في الصومال 🇸🇴'
      },
      benefits: {
        title: 'من يستفيد وكيف',
        rider: {
          who: 'تطبيق الراكب — العميل',
          for: 'الناس العاديون في لاسعانود الذين يحتاجون نقل أو طعام أو سيارة.',
          benefits: [
            'رحلات — استلام باچاج في دقائق، تتبع GPS حي، تسعير عادل',
            'توصيل طعام — اطلب من المطاعم المحلية مع تتبع التوصيل',
            'استئجار سيارات — سيارات بالساعة/اليوم مع حماية الإيداع',
            'اليانصيب — شارك في سحوبات الجوائز أثناء استخدام التطبيق',
            'تنبيهات SOS — تنبيه طوارئ بنقرة واحدة مع الموقع',
            'الدردشة — تواصل مباشرة مع السائق أثناء الرحلة',
            'دفع EVC/Zaad — ادفع بأموال الهاتف المحمول الصومالي',
            'التتبع الحي — شاهد السائق يقترب على الخريطة مباشرة'
          ]
        },
        driver: {
          who: 'تطبيق السائق — الكاسب',
          for: 'سائقو الباجاج والدراجات والسيارات الذين يريدون الربح.',
          benefits: [
            'كسب مزدوج — اقبل طلبات الرحلات وطلبات توصيل الطعام',
            'الموقع الحي — يظهر للركاب لتسهيل الاستلام',
            'الدردشة — تنسق مع الركاب دون مكالمات هاتفية',
            'نظام العمولة — تقسيم شفاف للأجرة، دفعات تلقائية',
            'لوحة السائق — تتبع التقييمات، إجمالي الرحلات، سجل الأرباح',
            'تبديل الاتصال — اتصل أو اقطع متى أردت'
          ]
        },
        store: {
          who: 'تطبيق مالك المتجر — صاحب المطعم',
          for: 'أصحاب المطاعم والمتاجر الذين يريدون الوصول لمزيد من العملاء.',
          benefits: [
            'إدارة الطلبات — اقبل وأدر طلبات التوصيل فوراً',
            'لوحة القائمة — حدّث الأصناف والأسعار والتوفر فوراً',
            'تتبع الإيرادات — شاهد أرباح اليوم/الأسبوع والتحليلات',
            'وصول العملاء — اكتشفك آلاف الركاب القريبون',
            'العروض — أطلق صفقات وتخفيضات لزيادة المبيعات'
          ]
        },
        provider: {
          who: 'تطبيق المزود — مدير الأسطول',
          for: 'مزودو تأجير السيارات الذين يديرون أساطيل ويريدون عمليات شفافة.',
          benefits: [
            'إدارة الأسطول — أضف وتتبع وأدر جميع مركباتك',
            'نظام الإيداع — ودائع ومدفوعات آمنة بشفافية كاملة',
            'لوحة الحجوزات — شاهد جميع طلبات الإيجار والإيجارات النشطة والإرجاع',
            'تقارير الإيرادات — تفصيل كامل للدخل لكل مركبة',
            'تحقق السائقين — تحقق ووافق على السائقين قبل الإيجار'
          ]
        },
        table: {
          app: 'التطبيق',
          who: 'لمن',
          mainBenefit: 'الفائدة الرئيسية',
          riderApp: 'الراكب',
          riderWho: 'العميل',
          riderBenefit: 'كل شيء عند الطلب، آمن ومحلي',
          driverApp: 'السائق',
          driverWho: 'الكاسب',
          driverBenefit: 'دخل مزدوج من الرحلات والتوصيل',
          storeApp: 'المتجر',
          storeWho: 'صاحب المطعم',
          storeBenefit: 'الوصول لآلاف العملاء الجدد',
          providerApp: 'المزود',
          providerWho: 'مدير الأسطول',
          providerBenefit: 'إدارة أسطول وودائع شفافة'
        }
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
