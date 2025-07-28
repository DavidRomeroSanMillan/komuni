import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Configuración de Firebase
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
const auth = getAuth(app);
const db = getFirestore(app);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reportes, setReportes] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      // Obtener los reportes personales del usuario desde la colección "usuarios"
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setReportes(data.reportes || []);
      } else {
        setReportes([]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Iniciar sesión</button>
      </form>
      {error && <p>{error}</p>}
      <h2>Mis reportes</h2>
      <ul>
        {reportes.map((reporte, idx) => (
          <li key={idx}>{JSON.stringify(reporte)}</li>
        ))}
      </ul>
    </div>
  );
};

export default Login;
