#!/usr/bin/env tsx

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { STUDENTS_BY_CLASSROOM, CLASSROOMS } from '../src/lib/mock-data';

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

interface StudentData {
  name: string;
  document: string;
  classroomId: string;
  createdAt: string;
}

async function clearExistingStudents(): Promise<void> {
  try {
    console.log('🧹 Limpiando estudiantes existentes...');
    
    const studentsSnapshot = await getDocs(collection(db, 'estudiantes'));
    let deletedCount = 0;
    
    for (const docSnapshot of studentsSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      deletedCount++;
      if (deletedCount % 10 === 0) {
        console.log(`   Eliminados ${deletedCount} estudiantes...`);
        await delay(100);
      }
    }
    
    console.log(`✅ ${deletedCount} estudiantes eliminados`);
    
  } catch (error) {
    console.error('⚠️ Error limpiando estudiantes:', error);
  }
}

async function populateStudents(): Promise<void> {
  try {
    console.log('🚀 Poblando estudiantes en Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado correctamente');
    console.log('');

    // Clear existing students
    await clearExistingStudents();
    console.log('');

    // Show summary
    const totalStudents = Object.values(STUDENTS_BY_CLASSROOM).flat().length;
    console.log('📊 Resumen de estudiantes a agregar:');
    console.log(`   Total: ${totalStudents} estudiantes`);
    console.log('');
    
    // Show breakdown by classroom
    console.log('📋 Desglose por salón:');
    Object.entries(STUDENTS_BY_CLASSROOM).forEach(([classroomId, students]) => {
      const classroom = CLASSROOMS.find(c => c.id === classroomId);
      if (classroom && students.length > 0) {
        console.log(`   - ${classroom.name}: ${students.length} estudiantes`);
      }
    });
    console.log('');

    // Add students
    console.log('👥 Agregando estudiantes...');
    let totalAdded = 0;
    
    for (const [classroomId, students] of Object.entries(STUDENTS_BY_CLASSROOM)) {
      if (students.length > 0) {
        const classroom = CLASSROOMS.find(c => c.id === classroomId);
        console.log(`📚 ${classroom?.name || classroomId}:`);
        
        for (const student of students) {
          try {
            const studentData: StudentData = {
              name: student.name,
              document: student.document,
              classroomId: classroomId,
              createdAt: new Date().toISOString(),
            };

            await addDoc(collection(db, 'estudiantes'), studentData);
            totalAdded++;
            
            // Show progress every 10 students
            if (totalAdded % 10 === 0) {
              console.log(`   ✅ ${totalAdded} estudiantes agregados...`);
            }
            
            // Small delay to avoid overwhelming Firebase
            await delay(50);
            
          } catch (error) {
            console.error(`   ❌ Error agregando ${student.name}:`, error);
          }
        }
        
        console.log(`   ✅ ${students.length} estudiantes agregados al ${classroom?.name || classroomId}`);
        console.log('');
      }
    }

    console.log('🎉 ¡Población de estudiantes completada!');
    console.log('');
    console.log('📈 Resumen final:');
    console.log(`   - ${totalAdded} estudiantes agregados exitosamente`);
    console.log('');
    console.log('🌐 Próximos pasos:');
    console.log('1. Visita http://localhost:9002 para usar la aplicación');
    console.log('2. Visita http://localhost:9002/admin para ver el estado');
    console.log('3. Selecciona un salón para ver los estudiantes');

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Declare db variable
let db: any;

populateStudents();
