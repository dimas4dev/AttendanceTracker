#!/usr/bin/env bun

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Inicializar Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Student {
  id: string;
  name: string;
  document: string;
}

interface AttendanceRecord {
  date: string;
  present: string[];
  absent: string[];
}

interface Classroom {
  id: string;
  name: string;
  roomNumber: string;
  courseType: string;
  courseLevel: string;
}

interface SummaryRow {
  Salón: string;
  Curso: string;
  'Total Estudiantes': number;
  'Días con Registro': number;
  'Total Registros': number;
  'Promedio Asistencia': string;
  'Última Fecha': string;
}

/**
 * Obtiene todos los salones de la base de datos
 */
async function getClassrooms(): Promise<Classroom[]> {
  try {
    const classroomsSnapshot = await getDocs(collection(db, 'salones'));
    const classrooms: Classroom[] = [];
    
    classroomsSnapshot.forEach((doc) => {
      const data = doc.data();
      classrooms.push({
        id: doc.id,
        name: data.name,
        roomNumber: data.roomNumber,
        courseType: data.courseType,
        courseLevel: data.courseLevel,
      });
    });
    
    return classrooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  } catch (error) {
    console.error('Error obteniendo salones:', error);
    throw new Error('Error al obtener los salones');
  }
}

/**
 * Obtiene todos los estudiantes de un salón específico
 */
async function getStudentsByClassroom(classroomId: string): Promise<Student[]> {
  try {
    const q = query(
      collection(db, 'estudiantes'),
      where('classroomId', '==', classroomId)
    );
    
    const querySnapshot = await getDocs(q);
    const students: Student[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      students.push({
        id: doc.id,
        name: data.name,
        document: data.document,
      });
    });
    
    return students.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    throw new Error('Error al obtener los estudiantes');
  }
}

/**
 * Obtiene el historial de asistencia de un salón específico
 */
async function getAttendanceHistory(classroomId: string): Promise<AttendanceRecord[]> {
  try {
    const q = query(
      collection(db, 'asistencias'),
      where('classroomId', '==', classroomId)
    );
    
    const querySnapshot = await getDocs(q);
    const records: AttendanceRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        date: data.date,
        present: data.present || [],
        absent: data.absent || [],
      });
    });
    
    // Ordenar por fecha
    return records.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error obteniendo historial de asistencia:', error);
    throw new Error('Error al obtener el historial de asistencia');
  }
}

/**
 * Convierte los datos a formato CSV
 */
function convertToCSV(data: SummaryRow[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => `"${value}"`).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

/**
 * Calcula el promedio de asistencia
 */
function calculateAttendanceAverage(presentCount: number, totalCount: number): string {
  if (totalCount === 0) return '0%';
  const percentage = (presentCount / totalCount) * 100;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Exporta un resumen estadístico de la asistencia por salón
 */
async function exportAttendanceSummary(): Promise<void> {
  try {
    console.log('📊 Generando resumen estadístico de asistencia...');
    console.log('');
    
    const classrooms = await getClassrooms();
    
    if (classrooms.length === 0) {
      console.log('⚠️  No se encontraron salones en la base de datos');
      return;
    }
    
    console.log(`📋 Procesando ${classrooms.length} salones...`);
    
    const summaryData: SummaryRow[] = [];
    
    for (const classroom of classrooms) {
      console.log(`   📊 Procesando ${classroom.name}...`);
      
      // Obtener estudiantes y asistencia
      const [students, attendanceHistory] = await Promise.all([
        getStudentsByClassroom(classroom.id),
        getAttendanceHistory(classroom.id)
      ]);
      
      const totalStudents = students.length;
      const daysWithRecords = attendanceHistory.length;
      
      if (daysWithRecords === 0) {
        summaryData.push({
          Salón: classroom.name,
          Curso: `${classroom.courseType} ${classroom.courseLevel}`,
          'Total Estudiantes': totalStudents,
          'Días con Registro': 0,
          'Total Registros': 0,
          'Promedio Asistencia': '0%',
          'Última Fecha': 'N/A',
        });
        console.log(`      ⚠️  Sin registros de asistencia`);
        continue;
      }
      
      // Calcular estadísticas
      let totalPresentRecords = 0;
      let totalRecords = 0;
      let lastDate = attendanceHistory[0].date;
      
      for (const record of attendanceHistory) {
        const presentCount = record.present.length;
        const absentCount = record.absent.length;
        const totalForDay = presentCount + absentCount;
        
        totalPresentRecords += presentCount;
        totalRecords += totalForDay;
      }
      
      const averageAttendance = calculateAttendanceAverage(totalPresentRecords, totalRecords);
      
      summaryData.push({
        Salón: classroom.name,
        Curso: `${classroom.courseType} ${classroom.courseLevel}`,
        'Total Estudiantes': totalStudents,
        'Días con Registro': daysWithRecords,
        'Total Registros': totalRecords,
        'Promedio Asistencia': averageAttendance,
        'Última Fecha': lastDate,
      });
      
      console.log(`      ✅ ${totalStudents} estudiantes, ${daysWithRecords} días, ${averageAttendance} promedio`);
    }
    
    // Convertir a CSV
    const csvContent = convertToCSV(summaryData);
    
    // Crear archivo
    const fileName = 'resumen_asistencia_general.csv';
    const filePath = join(process.cwd(), 'exports', fileName);
    
    // Crear directorio exports si no existe
    const fs = require('fs');
    const exportsDir = join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    // Escribir archivo
    writeFileSync(filePath, csvContent, 'utf8');
    
    console.log('');
    console.log('🎉 ¡Resumen generado exitosamente!');
    console.log(`📁 Archivo: ${fileName}`);
    console.log(`📍 Ubicación: ${filePath}`);
    console.log('');
    
    // Mostrar resumen en consola
    console.log('📊 Resumen General:');
    console.log('═══════════════════════════════════════════════════════════════');
    summaryData.forEach(row => {
      console.log(`🏫 ${row.Salón}`);
      console.log(`   📚 ${row.Curso}`);
      console.log(`   👥 Estudiantes: ${row['Total Estudiantes']}`);
      console.log(`   📅 Días registrados: ${row['Días con Registro']}`);
      console.log(`   📈 Promedio asistencia: ${row['Promedio Asistencia']}`);
      console.log(`   🗓️  Última fecha: ${row['Última Fecha']}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error generando resumen:', error);
    process.exit(1);
  }
}

// Función principal
async function main(): Promise<void> {
  await exportAttendanceSummary();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export { exportAttendanceSummary };
