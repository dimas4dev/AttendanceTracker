#!/usr/bin/env tsx

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Configuración de Firebase:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('');

async function testFirebaseConnection() {
  try {
    console.log('🚀 Inicializando Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado correctamente');
    
    // Test simple write
    console.log('📝 Probando escritura en Firestore...');
    const testDoc = doc(db, 'test', 'connection-test');
    
    await setDoc(testDoc, {
      message: 'Test de conexión',
      timestamp: new Date().toISOString(),
    });
    
    console.log('✅ Escritura exitosa');
    
    // Test simple read
    console.log('📖 Probando lectura de Firestore...');
    const docSnap = await getDoc(testDoc);
    
    if (docSnap.exists()) {
      console.log('✅ Lectura exitosa:', docSnap.data());
    } else {
      console.log('❌ No se pudo leer el documento');
    }
    
    console.log('');
    console.log('🎉 ¡Conexión a Firebase exitosa!');
    
  } catch (error) {
    console.error('❌ Error conectando a Firebase:', error);
    
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      
      if (error.message.includes('INVALID_ARGUMENT')) {
        console.log('');
        console.log('💡 Posibles soluciones:');
        console.log('1. Verifica que Firestore esté habilitado en Firebase Console');
        console.log('2. Verifica que las reglas de Firestore permitan lectura/escritura');
        console.log('3. Verifica que el proyecto ID sea correcto');
        console.log('4. Verifica tu conexión a internet');
      }
    }
    
    process.exit(1);
  }
}

testFirebaseConnection();
