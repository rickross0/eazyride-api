import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      heroTitle: 'EazyRide + Haye!',
      heroSub: 'Super App - Everything You Need',
      ctaRide: 'Get Started',
      ctaFood: 'Explore',
      ctaCars: 'Join Us',
      services: {
        title: 'One App, Three Ways to Use',
        customer: 'Customer',
        customerDesc: 'Shop, ride, and deliver - all in one place',
        merchant: 'Store / Merchant',
        merchantDesc: 'Grow your business with thousands of customers',
        driver: 'Driver / Rider',
        driverDesc: 'Earn money with rides and deliveries',
        customerFeatures: [
          'Browse restaurants, groceries, pharmacies',
          'Add items to cart, checkout with currency',
          'Request rides or deliveries',
          'Purchase credits via mobile money',
          'Optional subscription for perks',
          'Referral credits'
        ],
        merchantFeatures: [
          'Upload products, set prices in currency',
          'Manage inventory, receive orders',
          'Earn currency from sales',
          'Pay platform commissions',
          'Optional subscription for lower rates',
          'Merchant onboarding support'
        ],
        driverFeatures: [
          'Maintain account balance in credits',
          'Purchase credits via mobile money',
          'Accept ride/delivery requests',
          'Earn currency from completed services',
          '10% commission per transaction',
          'Optional subscription for lower commissions',
          'Driver recruitment bonuses'
        ]
      },
      downloads: {
        title: 'Download Now (Android)',
        rider: 'EazyRide Super App',
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
        copyright: '© 2026 Haye! Mobility Global Inc. All rights reserved.',
        operated: 'EazyRide + Haye! is operated by Haye! Mobility Global Inc.',
        madeIn: 'Made in Somalia 🇸🇴'
      },
      benefits: {
        title: 'Choose Your Path',
        customer: {
          who: 'Customer',
          for: 'Everyone who needs rides, food, groceries, or deliveries.',
          benefits: [
            'Browse curated verticals (restaurants, groceries, pharmacies)',
            'Add items to cart, checkout with in-app currency',
            'Request rides or deliveries',
            'Purchase credits via mobile money (admin verified)',
            'Optional subscription for perks',
            'Referral credits',
            'Secure EVC/Zaad payments'
          ]
        },
        merchant: {
          who: 'Store / Merchant',
          for: 'Restaurants, shops, and businesses wanting to reach more customers.',
          benefits: [
            'Upload product images, set prices in currency',
            'Manage inventory, receive orders',
            'Earn currency credits from sales',
            'Pay platform commissions',
            'Optional subscription for lower rates + features',
            'Merchant onboarding support',
            'Localized marketing per market'
          ]
        },
        driver: {
          who: 'Driver / Rider',
          for: 'Drivers with vehicles who want to earn income.',
          benefits: [
            'Maintain account balance (currency credits)',
            'Purchase credits via mobile money (admin verified)',
            'Use credits for commissions, expenses, withdrawals',
            'Accept ride/delivery requests',
            'Earn currency from completed services',
            '10% commission per transaction',
            'Optional subscription for lower commissions + perks',
            'Driver recruitment bonuses'
          ]
        },
        table: {
          app: 'App Type',
          who: 'Who',
          mainBenefit: 'Main Benefit',
          customerApp: 'Customer',
          customerWho: 'Shop & Ride',
          customerBenefit: 'Everything on-demand',
          merchantApp: 'Merchant',
          merchantWho: 'Sell Online',
          merchantBenefit: 'Reach thousands of customers',
          driverApp: 'Driver',
          driverWho: 'Earn Income',
          driverBenefit: 'Flexible earnings'
        }
      },
      howItWorks: {
        title: 'How It Works',
        step1: 'Download App',
        step1Desc: 'Get the EazyRide Super App from our website',
        step2: 'Choose Your Role',
        step2Desc: 'Sign up as Customer, Merchant, or Driver',
        step3: 'Start Using',
        step3Desc: 'Shop, sell, or earn based on your role'
      }
    }
  },
  so: {
    translation: {
      heroTitle: 'EazyRide + Haye!',
      heroSub: 'Super App - Walashaa Aad U Baahan tahay',
      ctaRide: 'Bilow',
      ctaFood: 'Saxeex',
      ctaCars: 'Qasb Qaado',
      services: {
        title: 'App keliya, Saddex Shaqo',
        customer: 'Macmiil',
        customerDesc: 'Iibso, wado, ama soo/guri - dhamaan hal meel',
        merchant: 'Dukaaneer / Store',
        merchantDesc: 'Korporusha ganacsigaagaarka adan milic badan',
        driver: 'Darawalka / Rider',
        driverDesc: 'Soo haayso lacagtaada adiga oo wado ama soo-guri',
        customerFeatures: [
          'Raadi malays, yaabaha, pharmacy-ga',
          'Ku dar dukumoobiyaha, iibso adiga oo isticmaalaya lacag',
          'Wado ama soo-guri dalbasho',
          'Ishiiska mobile money ee admin ka xaqiijiyay',
          'Xisaabinta ikhtiyaariga ah ee faaiido'
        ],
        merchantFeatures: [
          'Soo geli sawirrada, qiimaha dhig',
          'Maaree inventory-ga, geli dalbasho',
          'Hesho lacag ka ganacsatada',
          'Bixiicommission-ga platform-ka',
          'Xisaabinta ikhtiyaariga ah ee qiimo-yare'
        ],
        driverFeatures: [
          'Hay account balance-kaaga',
          'Ishiiska mobile money ee admin ka xaqiijiyay',
          'Aqbal dalbashooyinka wado/soo-guri',
          'Hesho lacag ka shaqo-dhamaystiran',
          '10% commission-ga shaqo kasta',
          'Xisaabinta ikhtiyaariga ah ee commission-yare'
        ]
      },
      downloads: {
        title: 'Hadda Degso (Android)',
        rider: 'EazyRide Super App',
        driver: 'Appka Darawalka',
        store: 'Appka Dukaaneerka',
        provider: 'Appka Provider-ka'
      },
      terms: {
        agree: 'Waxaan ansaxday',
        link: 'Shuruudaha & Xeerarka',
        mustAgree: 'Fadlan ansax Shuruudaha ka hor intaadan soo degsan.'
      },
      switchEn: 'English',
      switchSo: 'Soomaali',
      switchAr: 'العربية',
      footer: {
        legal: 'Sharciga',
        terms: 'Shuruudaha & Xeerarka',
        privacy: 'Qorshaha Arrimaha',
        rider: ' Heshiiska Ridaaga',
        driver: 'Heshiiska Darawalka',
        restaurant: 'Heshiiska Restaurant-ka',
        carrental: 'Shuruudaha Rentalka',
        community: 'Qaacidada Bulshada',
        refund: 'Qorshaha Lacag celinta',
        aml: 'AML & KYC',
        databreach: 'Qorshaha Jabiska Xogta',
        eula: 'EULA',
        dpa: 'Maareynta Xogta',
        dispute: 'Xalka Khilaafka',
        admin: 'Heshiiska Admin-ka',
        forcemajeure: 'Force Majeure',
        aup: 'Isticmaalka Ansaxan',
        copyright: '© 2026 Haye! Mobility Global Inc. Dhamaan xuquuqda waafaqsan.',
        operated: 'EazyRide + Haye! waa haye! Mobility Global Inc.',
        madeIn: 'Sameysay Somalia 🇸🇴'
      },
      benefits: {
        title: 'Dooro Jidadkaaga',
        customer: {
          who: 'Macmiil',
          for: 'Qof kasta oo u baahan wado, cunto,ader, ama soo-guri.',
          benefits: [
            'Raadi dukaamada (restaurants, groceries, pharmacies)',
            'Ku dar dukumoobiyaha, iibso adiga oo isticmaalaya lacag',
            'Wado ama soo-guri dalbasho',
            'Ishiiska mobile money (admin xaqiijiyay)',
            'Xisaabinta ikhtiyaariga ah',
            'Referral credits',
            'Payments-ka amtiga EVC/Zaad'
          ]
        },
        merchant: {
          who: 'Dukaaneer / Store',
          for: 'Restaurants, dukaamada, iyo ganacsiyada ee doonaya in ay gaadhaan macmiileen badan.',
          benefits: [
            'Soo geli sawirrada, qiimaha dhig',
            'Maaree inventory-ga, geli dalbasho',
            'Hesho credits-ka lacagta ka ganacsatada',
            'Bixiicommission-ga platform-ka',
            'Xisaabinta ikhtiyaariga ah + features',
            'Taageerada merchant onboarding',
            'Marketing-ga xeroboka ah'
          ]
        },
        driver: {
          who: 'Darawalka / Rider',
          for: 'Darawallada gaadiidka ee doonaya in ay soo haaystaan lacag.',
          benefits: [
            'Hay account balance-kaaga credits-ka',
            'Ishiiska mobile money (admin xaqiijiyay)',
            'Isticmaal credits-ka commission-ga, kharashka, withdraws',
            'Aqbal dalbashooyinka wado/soo-guri',
            'Hesho lacag ka shaqo-dhamaystiran',
            '10% commission-ga shaqo kasta',
            'Xisaabinta ikhtiyaariga ah + faaiido',
            'Bonus-yasha recruitment-ka'
          ]
        },
        table: {
          app: 'Nooca App-ka',
          who: 'Yee',
          mainBenefit: 'Faaiido Guud',
          customerApp: 'Macmiil',
          customerWho: 'Iibso & Wado',
          customerBenefit: 'Wax kasta marka aad u baahan tahay',
          merchantApp: 'Merchant',
          merchantWho: 'Iibso Online',
          merchantBenefit: 'Gaar macmiileen Badan',
          driverApp: 'Darawalka',
          driverWho: 'Soo Haayso',
          driverBenefit: 'Heshiyayaasha'
        }
      },
      howItWorks: {
        title: 'Sidee Ay U Shaqeysaa',
        step1: 'Soo Deg App-ka',
        step1Desc: 'EazyRide Super App ka soo degso website-ka',
        step2: 'DooroShaqadaada',
        step2Desc: 'Iska diiwaangeli Macmiil, Merchant, ama Driver',
        step3: 'Bilow Isticmaalka',
        step3Desc: 'Iibso, iibsi, ama soo haayso ee ku salaysan shaqadaada'
      }
    }
  },
  ar: {
    translation: {
      heroTitle: 'إيزي رايد + هي!',
      heroSub: 'تطبيق الكل في واحد - كل ما تحتاجه',
      ctaRide: 'ابدأ',
      ctaFood: 'استكشف',
      ctaCars: 'انضم',
      services: {
        title: 'تطبيق واحد ثلاثة أوضاع',
        customer: 'عميل',
        customerDesc: 'تسوق، اركب، وشغّل - كل شيء في مكان واحد',
        merchant: 'تاجر / متجر',
        merchantDesc: 'نمّ أعمالك مع آلاف العملاء',
        driver: 'سائق / رايدر',
        driverDesc: 'اربح المال من الركوب والتوصيل',
        customerFeatures: [
          'تصفح المطاعم والمواد الغذائية والصيدليات',
          'أضف للسلة والدفع بالعملة المحلية',
          'اطلب ركوب أو توصيل',
          'شراء الرصيد عبر المحفظة الإلكترونية',
          'اشتراك اختياري للمزايا'
        ],
        merchantFeatures: [
          'ارفع صور المنتجات وحدد الأسعار',
          'إدارة المخزون واستلام الطلبات',
          'Earn currency from المبيعات',
          'دفع عمولات المنصة',
          'اشتراك اختياري لأسعار أقل'
        ],
        driverFeatures: [
          'حافظ على رصيد الحساب',
          'شراء الرصيد عبر المحفظة الإلكترونية',
          'قبول طلبات الركوب والتوصيل',
          'Earn currency من الخدمات المكتملة',
          '10% عمولة لكل معاملة',
          'اشتراك اختياري لعمولات أقل'
        ]
      },
      downloads: {
        title: 'تحميل الآن (أندرويد)',
        rider: 'تطبيق إيزي رايد',
        driver: 'تطبيق السائق',
        store: 'تطبيق التاجر',
        provider: 'تطبيق المزود'
      },
      terms: {
        agree: 'أوافق على',
        link: 'الشروط والأحكام',
        mustAgree: 'يرجى الموافقة على الشروط قبل التحميل.'
      },
      switchEn: 'English',
      switchSo: 'Soomaali',
      switchAr: 'العربية',
      footer: {
        legal: 'قانوني',
        terms: 'الشروط والأحكام',
        privacy: 'سياسة الخصوصية',
        rider: 'اتفاقية الراكب',
        driver: 'اتفاقية السائق',
        restaurant: 'اتفاقية المطعم',
        carrental: 'شروط استئجار السيارات',
        community: 'إرشادات المجتمع',
        refund: 'سياسة الاسترداد',
        aml: 'مكافحة غسيل الأموال',
        databreach: 'سياسة اختراق البيانات',
        eula: 'ترخيص المستخدم',
        dpa: 'معالجة البيانات',
        dispute: 'حل النزاعات',
        admin: 'اتفاقية الإدارة',
        forcemajeure: 'القوة القاهرة',
        aup: 'الاستخدام المقبول',
        copyright: '© 2026 هاي! موبيليتي غلوبال إنك. جميع الحقوق محفوظة.',
        operated: 'إيزي رايد + هاي! تديرها هاي! موبيليتي غلوبال إنك.',
        madeIn: 'صنع في الصومال 🇸🇴'
      },
      benefits: {
        title: 'اختر طريقتك',
        customer: {
          who: 'عميل',
          for: 'كل من يحتاج ركوب أو طعام أو توصيل.',
          benefits: [
            'تصفح المتاجر (مطاعم، مواد غذائية، صيدليات)',
            'أضف للسلة بالدفع بالعملة المحلية',
            'اطلب ركوب أو توصيل',
            'شراء الرصيد عبر المحفظة (مدير يتحقق)',
            'اشتراك اختياري للمزايا',
            'رصيد الإحالة',
            'دفع آمن عبر EVC/Zaad'
          ]
        },
        merchant: {
          who: 'تاجر / متجر',
          for: 'المطاعم والمحلات التجارية التي تريد الوصول لمزيد من العملاء.',
          benefits: [
            'ارفع صور المنتجات وحدد الأسعار بالعملة',
            'إدارة المخزون واستلام الطلبات',
            'Earn currency credits من المبيعات',
            'دفع عمولات المنصة',
            'اشتراك اختياري لأسعار أقل + مميزات',
            'دعم تسجيل التجار',
            'تسويق محلي لكل سوق'
          ]
        },
        driver: {
          who: 'سائق / رايدر',
          for: 'السائقون الذين يريدون الدخل.',
          benefits: [
            'حافظ على رصيد الحساب (credits)',
            'شراء الرصيد عبر المحفظة (مدير يتحقق)',
            'استخدم الرصيد للعمولات والمصروفات والسحب',
            'قبول طلبات الركوب والتوصيل',
            'Earn currency من الخدمات المكتملة',
            '10% عمولة لكل معاملة',
            'اشتراك اختياري لعمولات أقل + مزايا',
            'مكافآت توظيف السائقين'
          ]
        },
        table: {
          app: 'نوع التطبيق',
          who: 'من',
          mainBenefit: 'الميزة الرئيسية',
          customerApp: 'عميل',
          customerWho: 'تسوق واركب',
          customerBenefit: 'كل شيء عند الطلب',
          merchantApp: 'تاجر',
          merchantWho: 'بيع أونلاين',
          merchantBenefit: 'الوصول لآلاف العملاء',
          driverApp: 'سائق',
          driverWho: 'اربح',
          driverBenefit: 'دخل مرن'
        }
      },
      howItWorks: {
        title: 'كيف يعمل',
        step1: 'حمل التطبيق',
        step1Desc: 'احصل على تطبيق إيزي رايد من الموقع',
        step2: 'اختر دورك',
        step2Desc: 'سجل كعميل أو تاجر أو سائق',
        step3: 'ابدأ الاستخدام',
        step3Desc: 'تسوق أو باع أو اربح حسب دورك'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
