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

interface AbsentStudentRecord {
  'Salón': string;
  'Curso': string;
  'Nombre Estudiante': string;
  'Documento': string;
  'Total Ausencias': number;
  'Fechas de Ausencia': string;
  'Porcentaje Ausencia': string;
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
function convertToCSV(data: AbsentStudentRecord[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => `"${value}"`).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

/**
 * Convierte los datos a formato TXT legible
 */
function convertToTXT(data: AbsentStudentRecord[]): string {
  if (data.length === 0) return 'No se encontraron estudiantes con ausencias.';
  
  let txtContent = '';
  txtContent += 'REPORTE DE ESTUDIANTES AUSENTES\n';
  txtContent += '='.repeat(80) + '\n\n';
  txtContent += `Fecha de generación: ${new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}\n\n`;
  
  // Agrupar por salón
  const groupedByClassroom = new Map<string, AbsentStudentRecord[]>();
  data.forEach(record => {
    if (!groupedByClassroom.has(record.Salón)) {
      groupedByClassroom.set(record.Salón, []);
    }
    groupedByClassroom.get(record.Salón)!.push(record);
  });
  
  // Generar contenido por salón
  for (const [classroomName, records] of groupedByClassroom) {
    txtContent += `SALÓN: ${classroomName}\n`;
    txtContent += `CURSO: ${records[0].Curso}\n`;
    txtContent += `TOTAL ESTUDIANTES AUSENTES: ${records.length}\n`;
    txtContent += '-'.repeat(60) + '\n\n';
    
    records.forEach((record, index) => {
      txtContent += `${index + 1}. ${record['Nombre Estudiante']}\n`;
      txtContent += `   Documento: ${record.Documento}\n`;
      txtContent += `   Total Ausencias: ${record['Total Ausencias']}\n`;
      txtContent += `   Porcentaje Ausencia: ${record['Porcentaje Ausencia']}\n`;
      txtContent += `   Fechas de Ausencia: ${record['Fechas de Ausencia']}\n\n`;
    });
    
    txtContent += '\n';
  }
  
  // Estadísticas generales
  const totalAbsentStudents = data.length;
  const totalAbsences = data.reduce((sum, record) => sum + record['Total Ausencias'], 0);
  const averageAbsences = (totalAbsences / totalAbsentStudents).toFixed(1);
  
  txtContent += 'ESTADÍSTICAS GENERALES\n';
  txtContent += '='.repeat(40) + '\n';
  txtContent += `Total estudiantes con ausencias: ${totalAbsentStudents}\n`;
  txtContent += `Total ausencias registradas: ${totalAbsences}\n`;
  txtContent += `Promedio de ausencias por estudiante: ${averageAbsences}\n`;
  txtContent += `Total salones con ausencias: ${groupedByClassroom.size}\n`;
  
  return txtContent;
}

/**
 * Formatea una fecha para mostrar de manera legible
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calcula el porcentaje de ausencia
 */
function calculateAbsencePercentage(absenceCount: number, totalDays: number): string {
  if (totalDays === 0) return '0%';
  const percentage = (absenceCount / totalDays) * 100;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Exporta un reporte de estudiantes ausentes con sus estadísticas
 */
async function exportAbsentStudents(): Promise<void> {
  try {
    console.log('📊 Generando reporte de estudiantes ausentes...');
    console.log('');
    
    const classrooms = await getClassrooms();
    
    if (classrooms.length === 0) {
      console.log('⚠️  No se encontraron salones en la base de datos');
      return;
    }
    
    console.log(`📋 Procesando ${classrooms.length} salones...`);
    
    const absentStudentsData: AbsentStudentRecord[] = [];
    
    for (const classroom of classrooms) {
      console.log(`   📊 Procesando ${classroom.name}...`);
      
      // Obtener estudiantes y asistencia
      const [students, attendanceHistory] = await Promise.all([
        getStudentsByClassroom(classroom.id),
        getAttendanceHistory(classroom.id)
      ]);
      
      if (attendanceHistory.length === 0) {
        console.log(`      ⚠️  Sin registros de asistencia`);
        continue;
      }
      
      // Crear mapa de estudiantes para acceso rápido
      const studentsMap = new Map(students.map(s => [s.id, s]));
      
      // Contar ausencias por estudiante
      const studentAbsences = new Map<string, { count: number; dates: string[] }>();
      
      // Inicializar contadores para todos los estudiantes
      students.forEach(student => {
        studentAbsences.set(student.id, { count: 0, dates: [] });
      });
      
      // Procesar cada registro de asistencia
      for (const record of attendanceHistory) {
        for (const absentStudentId of record.absent) {
          const current = studentAbsences.get(absentStudentId);
          if (current) {
            current.count++;
            current.dates.push(record.date);
          }
        }
      }
      
      // Filtrar solo estudiantes que han tenido ausencias
      const studentsWithAbsences = Array.from(studentAbsences.entries())
        .filter(([_, data]) => data.count > 0)
        .sort((a, b) => b[1].count - a[1].count); // Ordenar por cantidad de ausencias
      
      // Agregar al reporte
      for (const [studentId, absenceData] of studentsWithAbsences) {
        const student = studentsMap.get(studentId);
        if (student) {
          const totalDays = attendanceHistory.length;
          const absencePercentage = calculateAbsencePercentage(absenceData.count, totalDays);
          
          // Ordenar fechas de ausencia
          const sortedDates = absenceData.dates.sort();
          const formattedDates = sortedDates.map(formatDate).join(', ');
          
          absentStudentsData.push({
            'Salón': classroom.name,
            'Curso': `${classroom.courseType} ${classroom.courseLevel}`,
            'Nombre Estudiante': student.name,
            'Documento': student.document,
            'Total Ausencias': absenceData.count,
            'Fechas de Ausencia': formattedDates,
            'Porcentaje Ausencia': absencePercentage,
          });
        }
      }
      
      console.log(`      ✅ ${studentsWithAbsences.length} estudiantes con ausencias encontrados`);
    }
    
    if (absentStudentsData.length === 0) {
      console.log('');
      console.log('🎉 ¡Excelente! No se encontraron estudiantes con ausencias.');
      return;
    }
    
    // Convertir a CSV y TXT
    const csvContent = convertToCSV(absentStudentsData);
    const txtContent = convertToTXT(absentStudentsData);
    
    // Crear archivos
    const dateString = new Date().toISOString().split('T')[0];
    const csvFileName = `estudiantes_ausentes_${dateString}.csv`;
    const txtFileName = `estudiantes_ausentes_${dateString}.txt`;
    
    const csvFilePath = join(process.cwd(), 'exports', csvFileName);
    const txtFilePath = join(process.cwd(), 'exports', txtFileName);
    
    // Crear directorio exports si no existe
    const fs = require('fs');
    const exportsDir = join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    // Escribir archivos
    writeFileSync(csvFilePath, csvContent, 'utf8');
    writeFileSync(txtFilePath, txtContent, 'utf8');
    
    console.log('');
    console.log('🎉 ¡Reporte de estudiantes ausentes generado exitosamente!');
    console.log(`📁 Archivo CSV: ${csvFileName}`);
    console.log(`📍 Ubicación CSV: ${csvFilePath}`);
    console.log(`📁 Archivo TXT: ${txtFileName}`);
    console.log(`📍 Ubicación TXT: ${txtFilePath}`);
    console.log('');
    
    // Mostrar resumen en consola
    console.log('📊 Resumen de Estudiantes Ausentes:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Agrupar por salón para mostrar mejor
    const groupedByClassroom = new Map<string, AbsentStudentRecord[]>();
    absentStudentsData.forEach(record => {
      if (!groupedByClassroom.has(record.Salón)) {
        groupedByClassroom.set(record.Salón, []);
      }
      groupedByClassroom.get(record.Salón)!.push(record);
    });
    
    for (const [classroomName, records] of groupedByClassroom) {
      console.log(`🏫 ${classroomName} (${records[0].Curso})`);
      console.log(`   📊 Total estudiantes ausentes: ${records.length}`);
      
      records.forEach(record => {
        console.log(`   👤 ${record['Nombre Estudiante']} (${record.Documento})`);
        console.log(`      ❌ Ausencias: ${record['Total Ausencias']} (${record['Porcentaje Ausencia']})`);
        console.log(`      📅 Fechas: ${record['Fechas de Ausencia']}`);
        console.log('');
      });
    }
    
    // Estadísticas generales
    const totalAbsentStudents = absentStudentsData.length;
    const totalAbsences = absentStudentsData.reduce((sum, record) => sum + record['Total Ausencias'], 0);
    const averageAbsences = (totalAbsences / totalAbsentStudents).toFixed(1);
    
    console.log('📈 Estadísticas Generales:');
    console.log(`   👥 Total estudiantes con ausencias: ${totalAbsentStudents}`);
    console.log(`   ❌ Total ausencias registradas: ${totalAbsences}`);
    console.log(`   📊 Promedio de ausencias por estudiante: ${averageAbsences}`);
    
  } catch (error) {
    console.error('❌ Error generando reporte de ausentes:', error);
    process.exit(1);
  }
}

// Función principal
async function main(): Promise<void> {
  await exportAbsentStudents();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export { exportAbsentStudents };
