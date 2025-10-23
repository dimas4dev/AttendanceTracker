'use server';

import { z } from 'zod';
import { saveAttendanceRecord } from '@/lib/data';
import { type Student } from '@/lib/types';
import { format } from 'date-fns';

const AttendanceSchema = z.object({
  classroomId: z.string(),
  attendanceDate: z.string(),
  students: z.array(z.object({
    id: z.string(),
    absent: z.boolean(),
  })),
});

export async function saveAttendance(
  allStudents: Student[],
  formData: unknown
): Promise<{ success: boolean; message: string }> {
  const parsed = AttendanceSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, message: 'Datos inválidos.' };
  }

  const { classroomId, attendanceDate, students: studentStatuses } = parsed.data;
  
  // Validar que la fecha no sea futura
  const selectedDate = new Date(attendanceDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
  
  if (selectedDate > today) {
    return { success: false, message: 'No se puede registrar asistencia para fechas futuras.' };
  }
  
  // Validar formato de fecha
  const date = format(selectedDate, 'yyyy-MM-dd');
  if (date !== attendanceDate) {
    return { success: false, message: 'Formato de fecha inválido.' };
  }

  const absentStudentIds = studentStatuses
    .filter(s => s.absent)
    .map(s => s.id);
    
  const presentStudentIds = allStudents
    .filter(student => !absentStudentIds.includes(student.id))
    .map(student => student.id);

  const attendanceRecord = {
    date,
    present: presentStudentIds,
    absent: absentStudentIds,
  };

  try {
    const result = await saveAttendanceRecord(classroomId, attendanceRecord);
    return result;
  } catch (error) {
    console.error('Failed to save attendance:', error);
    return { success: false, message: 'Ocurrió un error al guardar la asistencia.' };
  }
}
