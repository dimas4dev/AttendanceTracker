#!/usr/bin/env tsx

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { CLASSROOMS, STUDENTS_BY_CLASSROOM } from '../src/lib/mock-data';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface ClassroomData {
  name: string;
  roomNumber: string;
  courseType: string;
  courseLevel: string;
  createdAt: string;
}

interface StudentData {
  name: string;
  document: string;
  classroomId: string;
  createdAt: string;
}

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function clearFirestoreData(): Promise<void> {
  try {
    console.log('🧹 Limpiando datos existentes...');
    
    // Clear students
    const studentsSnapshot = await getDocs(collection(db, 'estudiantes'));
    for (const docSnapshot of studentsSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      await delay(100); // Add small delay between deletions
    }
    console.log(`✅ ${studentsSnapshot.size} estudiantes eliminados`);
    
    // Clear attendance records
    const attendanceSnapshot = await getDocs(collection(db, 'asistencias'));
    for (const docSnapshot of attendanceSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      await delay(100); // Add small delay between deletions
    }
    console.log(`✅ ${attendanceSnapshot.size} registros de asistencia eliminados`);
    
    // Clear classrooms
    const classroomsSnapshot = await getDocs(collection(db, 'salones'));
    for (const docSnapshot of classroomsSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      await delay(100); // Add small delay between deletions
    }
    console.log(`✅ ${classroomsSnapshot.size} salones eliminados`);
    
  } catch (error) {
    console.error('⚠️ Error limpiando datos (puede ser normal si no hay datos):', error);
  }
}

async function populateFirebase(): Promise<void> {
  try {
    console.log('🚀 Iniciando población de Firebase...');
    console.log('📊 Datos a poblar:');
    console.log(`   - ${CLASSROOMS.length} salones`);
    const totalStudents = Object.values(STUDENTS_BY_CLASSROOM).flat().length;
    console.log(`   - ${totalStudents} estudiantes`);
    console.log('');
    
    // Mostrar resumen por salón
    console.log('📋 Resumen por salón:');
    Object.entries(STUDENTS_BY_CLASSROOM).forEach(([classroomId, students]) => {
      const classroom = CLASSROOMS.find(c => c.id === classroomId);
      if (classroom && students.length > 0) {
        console.log(`   - ${classroom.name}: ${students.length} estudiantes`);
      }
    });
    console.log('');

    // Clear existing data first
    await clearFirestoreData();
    console.log('');

    // 1. Seed classrooms with detailed information
    console.log('🏢 Agregando salones...');
    for (const classroom of CLASSROOMS) {
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
      console.log(`   ✅ ${classroom.name}`);
      await delay(200); // Add delay between classroom creations
    }

    // 2. Seed students (if any exist)
    console.log('');
    console.log('👥 Agregando estudiantes...');
    let totalStudents = 0;
    
    if (Object.keys(STUDENTS_BY_CLASSROOM).length > 0) {
      for (const [classroomId, students] of Object.entries(STUDENTS_BY_CLASSROOM)) {
        if (students.length > 0) {
          for (const student of students) {
            const studentData: StudentData = {
              name: student.name,
              document: student.document,
              classroomId: classroomId,
              createdAt: new Date().toISOString(),
            };

            await addDoc(collection(db, 'estudiantes'), studentData);
            totalStudents++;
          }
          console.log(`   ✅ ${classroomId}: ${students.length} estudiantes`);
        }
      }
    } else {
      console.log('   ℹ️  No hay estudiantes definidos en mock-data.ts');
      console.log('   💡 Puedes agregar estudiantes editando src/lib/mock-data.ts');
    }

    // 3. Create sample attendance records (only if there are students)
    console.log('');
    console.log('📋 Creando registros de asistencia de ejemplo...');
    
    if (totalStudents > 0) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      for (const classroom of CLASSROOMS) {
        const students = STUDENTS_BY_CLASSROOM[classroom.id] || [];
        if (students.length > 0) {
          // Create sample attendance for yesterday
          const presentStudents = students.slice(0, Math.floor(students.length * 0.8));
          const absentStudents = students.filter(s => !presentStudents.find(p => p.id === s.id));

          await addDoc(collection(db, 'asistencias'), {
            classroomId: classroom.id,
            date: yesterday.toISOString().split('T')[0], // YYYY-MM-DD format
            present: presentStudents.map(s => s.id),
            absent: absentStudents.map(s => s.id),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          console.log(`   ✅ ${classroom.name}: ${presentStudents.length} presentes, ${absentStudents.length} ausentes`);
        }
      }
    } else {
      console.log('   ℹ️  No se crearon registros de asistencia (no hay estudiantes)');
    }

    console.log('');
    console.log('🎉 ¡Población de Firebase completada exitosamente!');
    console.log('');
    console.log('📈 Resumen:');
    console.log(`   - ${CLASSROOMS.length} salones configurados`);
    console.log(`   - ${totalStudents} estudiantes agregados`);
    console.log(`   - ${CLASSROOMS.length} registros de asistencia de ejemplo creados`);
    console.log('');
    console.log('🌐 Ahora puedes usar la aplicación en: http://localhost:9002');

  } catch (error) {
    console.error('❌ Error poblando Firebase:', error);
    process.exit(1);
  }
}

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Run the script
populateFirebase()
  .then(() => {
    console.log('✅ Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });
