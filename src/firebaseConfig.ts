import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


//npm i fireabase

// TODO: Reemplaza estos valores por la configuración real de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDY4x8s6HJO5O8zfR5oeJRjW8iy9mJakHo",
  authDomain: "komuni-app.firebaseapp.com",
  databaseURL: "https://komuni-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "komuni-app",
  storageBucket: "komuni-app.firebasestorage.app",
  messagingSenderId: "1039755494173",
  appId: "1:1039755494173:web:11e00b664e58cc9c46d7f4",
  measurementId: "G-W7KFF9QJLK"
};

const app = initializeApp(firebaseConfig);


export const db = getDatabase(app);
export const storage = getStorage(app);