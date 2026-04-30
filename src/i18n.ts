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
        haye: 'Haye!: Car Rental & Services',
        desc1: 'Real-time Bajaj rides in Laascaanood.',
        desc2: 'Fresh meals delivered fast.',
        desc3: 'Premium cars with escrow safety.'
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
      switchLang: 'Soomaali'
    }
  },
  so: {
    translation: {
      heroTitle: 'EazyRide + Haye!',
      heroSub: 'Safar degdeg ah & Ammaan • Cunto macaan • Gaadiid la isku hallayn karo',
      ctaRide: 'Dalban Safar',
      ctaFood: 'Dalban Cunto',
      ctaCars: 'Kireys Ash',
      services: {
        title: 'Adeegyadayada',
        eazyride: 'EazyRide: Safarrada & Gaadiidka Cunnada',
        haye: 'Haye!: Kirada Gaadiidka & Adeegyada',
        desc1: 'Safar Bajaj ee Laascaanood ee waqtiga dhabta ah.',
        desc2: 'Cunto cusub oo degdeg ah.',
        desc3: 'Gaadiidka premium oo leh ammaan escrow.'
      },
      downloads: {
        title: 'Kala Soo Bax (Android)',
        rider: 'App Rider',
        driver: 'App Driver',
        store: 'Mulkiilaha Dukaan',
        provider: 'Bixiye Adeeg'
      },
      terms: {
        agree: 'Waan ogolahay',
        link: 'Shuruudaha & Qaa\'dada',
        mustAgree: 'Fadlan ogow shuruudaha ka hor soo dejinta.'
      },
      switchLang: 'English'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
