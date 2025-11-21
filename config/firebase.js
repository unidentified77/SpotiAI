import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase yapılandırma bilgilerinizi buraya ekleyin
// Firebase Console'dan alacağınız config objesi
const firebaseConfig = {
    apiKey: "AIzaSyB6TVzfrh9-P0BqnqOA9Htd-IRWAY181A0",
    authDomain: "spotiai-d051a.firebaseapp.com",
    projectId: "spotiai-d051a",
    storageBucket: "spotiai-d051a.firebasestorage.app",
    messagingSenderId: "641109368920",
    appId: "1:641109368920:web:3a93cc6d2380497f75aa2d",
    measurementId: "G-JYBG9SK4Z4"
  };

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth ve Firestore servislerini export et
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

