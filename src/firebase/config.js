import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {

  apiKey: "AIzaSyDglUrh6FZLth5O2iYImTpRXo_PowOnu_4",

  authDomain: "dream-crt.firebaseapp.com",

  projectId: "dream-crt",

  storageBucket: "dream-crt.firebasestorage.app",

  messagingSenderId: "85071233869",

  appId: "1:85071233869:web:ce510ad56470bf2142ed04"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

export { auth, db, storage };