// Firebase Configuration — Mr. Banana Game
// Using compat SDK (works with plain <script> tags, no npm/bundler needed)

const firebaseConfig = {
    apiKey: "AIzaSyDursmf8KUBZEh3rsXlJpRtUm-jTAhNng4",
    authDomain: "mr-banana-game.firebaseapp.com",
    projectId: "mr-banana-game",
    storageBucket: "mr-banana-game.firebasestorage.app",
    messagingSenderId: "331296067862",
    appId: "1:331296067862:web:c124fc3688506bfb9ec037"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firestore instance as global `db`
const db = firebase.firestore();
