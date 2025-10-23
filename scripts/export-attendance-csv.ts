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

interface CSVRow {
  Fecha: string;
  Estudiante: string;
  Documento: string;
  Estado: 'Presente' | 'Ausente';
  Salón: string;
  Curso: string;
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
function convertToCSV(data: CSVRow[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => `"${value}"`).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

/**
 * Exporta la asistencia de un salón específico a CSV
 */
async function exportClassroomAttendance(classroomId: string, classroomName: string): Promise<void> {
  try {
    console.log(`📊 Procesando ${classroomName}...`);
    
    // Obtener estudiantes y asistencia
    const [students, attendanceHistory] = await Promise.all([
      getStudentsByClassroom(classroomId),
      getAttendanceHistory(classroomId)
    ]);
    
    if (students.length === 0) {
      console.log(`   ⚠️  No hay estudiantes en ${classroomName}`);
      return;
    }
    
    if (attendanceHistory.length === 0) {
      console.log(`   ⚠️  No hay registros de asistencia en ${classroomName}`);
      return;
    }
    
    // Crear mapa de estudiantes para búsqueda rápida
    const studentsMap = new Map(students.map(s => [s.id, s]));
    
    // Generar datos CSV
    const csvData: CSVRow[] = [];
    
    for (const record of attendanceHistory) {
      // Agregar estudiantes presentes
      for (const studentId of record.present) {
        const student = studentsMap.get(studentId);
        if (student) {
          csvData.push({
            Fecha: record.date,
            Estudiante: student.name,
            Documento: student.document,
            Estado: 'Presente',
            Salón: classroomName,
            Curso: `${classroomName.split(' - ')[1] || ''}`,
          });
        }
      }
      
      // Agregar estudiantes ausentes
      for (const studentId of record.absent) {
        const student = studentsMap.get(studentId);
        if (student) {
          csvData.push({
            Fecha: record.date,
            Estudiante: student.name,
            Documento: student.document,
            Estado: 'Ausente',
            Salón: classroomName,
            Curso: `${classroomName.split(' - ')[1] || ''}`,
          });
        }
      }
    }
    
    // Ordenar por fecha y nombre
    csvData.sort((a, b) => {
      if (a.Fecha !== b.Fecha) {
        return b.Fecha.localeCompare(a.Fecha); // Fecha descendente
      }
      return a.Estudiante.localeCompare(b.Estudiante);
    });
    
    // Convertir a CSV
    const csvContent = convertToCSV(csvData);
    
    // Crear nombre de archivo seguro
    const safeFileName = classroomName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    
    const fileName = `asistencia_${safeFileName}.csv`;
    const filePath = join(process.cwd(), 'exports', fileName);
    
    // Crear directorio exports si no existe
    const fs = require('fs');
    const exportsDir = join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    // Escribir archivo
    writeFileSync(filePath, csvContent, 'utf8');
    
    console.log(`   ✅ Exportado: ${fileName} (${csvData.length} registros)`);
    console.log(`   📍 Ubicación: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error exportando ${classroomName}:`, error);
  }
}

/**
 * Exporta la asistencia de todos los salones a CSV
 */
async function exportAllClassroomsAttendance(): Promise<void> {
  try {
    console.log('🚀 Iniciando exportación de asistencia...');
    console.log('');
    
    const classrooms = await getClassrooms();
    
    if (classrooms.length === 0) {
      console.log('⚠️  No se encontraron salones en la base de datos');
      return;
    }
    
    console.log(`📋 Encontrados ${classrooms.length} salones:`);
    classrooms.forEach(classroom => {
      console.log(`   - ${classroom.name}`);
    });
    console.log('');
    
    // Exportar cada salón
    for (const classroom of classrooms) {
      await exportClassroomAttendance(classroom.id, classroom.name);
      console.log('');
    }
    
    console.log('🎉 ¡Exportación completada exitosamente!');
    console.log('📁 Los archivos CSV se han guardado en la carpeta "exports"');
    
  } catch (error) {
    console.error('❌ Error en la exportación:', error);
    process.exit(1);
  }
}

/**
 * Exporta la asistencia de un salón específico
 */
async function exportSingleClassroomAttendance(classroomId: string): Promise<void> {
  try {
    console.log('🚀 Iniciando exportación de asistencia...');
    console.log('');
    
    const classrooms = await getClassrooms();
    const classroom = classrooms.find(c => c.id === classroomId);
    
    if (!classroom) {
      console.log(`❌ No se encontró el salón con ID: ${classroomId}`);
      return;
    }
    
    await exportClassroomAttendance(classroom.id, classroom.name);
    
    console.log('🎉 ¡Exportación completada exitosamente!');
    console.log('📁 El archivo CSV se ha guardado en la carpeta "exports"');
    
  } catch (error) {
    console.error('❌ Error en la exportación:', error);
    process.exit(1);
  }
}

// Función principal
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Exportar todos los salones
    await exportAllClassroomsAttendance();
  } else if (args.length === 1 && args[0] === '--help') {
    console.log('📋 Uso del script de exportación de asistencia:');
    console.log('');
    console.log('  bun run export-attendance-csv                    # Exportar todos los salones');
    console.log('  bun run export-attendance-csv <classroom-id>     # Exportar salón específico');
    console.log('  bun run export-attendance-csv --help             # Mostrar esta ayuda');
    console.log('');
    console.log('Ejemplos:');
    console.log('  bun run export-attendance-csv salon-304          # Exportar solo el salón 304');
    console.log('  bun run export-attendance-csv                    # Exportar todos los salones');
  } else {
    // Exportar salón específico
    const classroomId = args[0];
    await exportSingleClassroomAttendance(classroomId);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export { exportAllClassroomsAttendance, exportSingleClassroomAttendance };
