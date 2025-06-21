// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCgXgowo8UPxY6afA9XO4RZV72O4T6gmhU",
    authDomain: "sports-buddy-1.firebaseapp.com",
    projectId: "sports-buddy-1",
    storageBucket: "sports-buddy-1.firebasestorage.app",
    messagingSenderId: "1076714143574",
    appId: "1:1076714143574:web:9106575c17b98ccb8a60f7",
    measurementId: "G-9HKW7K6JEB"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the initialized app
export default app;