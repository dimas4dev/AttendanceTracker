'use server';
import { CLASSROOMS, STUDENTS_BY_CLASSROOM, ATTENDANCE_HISTORY } from './mock-data';
import type { Classroom, Student, AttendanceRecord } from './types';
import { slugify } from './utils';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getClassrooms(): Promise<Classroom[]> {
  await delay(200);
  return CLASSROOMS;
}

export async function findClassroomBySlug(slug: string): Promise<Classroom | undefined> {
  await delay(100);
  return CLASSROOMS.find(c => slugify(c.name) === slug);
}

export async function findClassroomById(id: string): Promise<Classroom | undefined> {
  await delay(100);
  return CLASSROOMS.find(c => c.id === id);
}

export async function getStudentsByClassroom(classroomId: string): Promise<Student[]> {
  await delay(500);
  return STUDENTS_BY_CLASSROOM[classroomId] || [];
}

export async function getAttendanceHistory(classroomId: string): Promise<AttendanceRecord[]> {
  await delay(300);
  return ATTENDANCE_HISTORY[classroomId] || [];
}

export async function saveAttendanceRecord(classroomId: string, record: AttendanceRecord): Promise<{ success: boolean; message: string }> {
  await delay(1000); // Simulate saving delay

  if (!ATTENDANCE_HISTORY[classroomId]) {
    ATTENDANCE_HISTORY[classroomId] = [];
  }

  const existingRecordIndex = ATTENDANCE_HISTORY[classroomId].findIndex(r => r.date === record.date);

  if (existingRecordIndex > -1) {
    // Update existing record
    ATTENDANCE_HISTORY[classroomId][existingRecordIndex] = record;
    console.log(`Updated attendance for ${classroomId} on ${record.date}`);
    return { success: true, message: 'Asistencia actualizada correctamente.' };
  } else {
    // Add new record
    ATTENDANCE_HISTORY[classroomId].push(record);
    // Sort by date descending
    ATTENDANCE_HISTORY[classroomId].sort((a, b) => b.date.localeCompare(a.date));
    console.log(`Saved new attendance for ${classroomId} on ${record.date}`);
    return { success: true, message: 'Asistencia registrada correctamente.' };
  }
}
