import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDzwmCLBYe0jxF5niLckrIj3JFKiD4PPPk",
  authDomain: "pump-a4002.firebaseapp.com",
  databaseURL: "https://pump-a4002-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pump-a4002",
  storageBucket: "pump-a4002.appspot.com",
  messagingSenderId: "532653806254",
  appId: "1:532653806254:web:9652d60a87c3adba28d33f",
  measurementId: "G-6QDH1YDHWY"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Realtime Database
const database = getDatabase(app);

export default database;
