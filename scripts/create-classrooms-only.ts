#!/usr/bin/env tsx

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { CLASSROOMS } from '../src/lib/mock-data';

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

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ClassroomData {
  name: string;
  roomNumber: string;
  courseType: string;
  courseLevel: string;
  createdAt: string;
}

async function createClassroomsOnly(): Promise<void> {
  try {
    console.log('🚀 Creando solo los salones en Firebase...');
    console.log(`📊 Total de salones a crear: ${CLASSROOMS.length}`);
    console.log('');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado correctamente');
    console.log('');

    // Create classrooms one by one
    console.log('🏢 Creando salones...');
    
    for (let i = 0; i < CLASSROOMS.length; i++) {
      const classroom = CLASSROOMS[i];
      
      try {
        console.log(`[${i + 1}/${CLASSROOMS.length}] Creando: ${classroom.name}`);
        
        const [roomNumber, courseInfo] = classroom.name.split(' - ');
        const [courseType, courseLevel] = courseInfo.split(' ');
        
        const classroomData: ClassroomData = {
          name: classroom.name,
          roomNumber: roomNumber.replace('SALÓN ', ''),
          courseType: courseType,
          courseLevel: courseLevel,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'salones', classroom.id), classroomData);
        console.log(`   ✅ Creado exitosamente`);
        
        // Add delay between creations
        if (i < CLASSROOMS.length - 1) {
          await delay(500); // 500ms delay between each classroom
        }
        
      } catch (error) {
        console.error(`   ❌ Error creando ${classroom.name}:`, error);
        // Continue with next classroom instead of stopping
      }
    }

    console.log('');
    console.log('🎉 Proceso de creación de salones completado!');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Visita http://localhost:9002 para ver la aplicación');
    console.log('2. Visita http://localhost:9002/admin para ver el estado');
    console.log('3. Agrega estudiantes manualmente desde la interfaz o edita mock-data.ts');

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

createClassroomsOnly();
