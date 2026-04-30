const admin = require('firebase-admin');

let initialized = false;

function getFirebaseAdmin() {
  if (initialized) return admin;

  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath) {
    try {
      const serviceAccount = require(require('path').resolve(serviceAccountPath));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase] Initialized with service account');
    } catch (err) {
      console.error('[Firebase] Failed to initialize with service account:', err.message);
      console.error('[Firebase] Push notifications will NOT work. Set GOOGLE_APPLICATION_CREDENTIALS in .env');
    }
  } else {
    console.warn('[Firebase] GOOGLE_APPLICATION_CREDENTIALS not set — push notifications are disabled.');
    console.warn('[Firebase] To enable, download your Firebase service account key and set the path in .env.');
  }

  initialized = true;
  return admin;
}

module.exports = { getFirebaseAdmin };
