import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDeu4KneHTu0pc69KZb2I4dpoeGT_iIpS4",
    authDomain: "paidtasksversiontwo.firebaseapp.com",
    projectId: "paidtasksversiontwo",
    storageBucket: "paidtasksversiontwo.firebasestorage.app",
    messagingSenderId: "1063979702753",
    appId: "1:1063979702753:web:0e06fd5deeb85528331aa0",
    measurementId: "G-EG30BCNRK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

export { auth, db, storage, functions, analytics };
export default app;