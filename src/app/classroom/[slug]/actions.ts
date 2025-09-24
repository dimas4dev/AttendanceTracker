'use server';

import { z } from 'zod';
import { saveAttendanceRecord } from '@/lib/data';
import { type Student } from '@/lib/types';
import { format } from 'date-fns';

const AttendanceSchema = z.object({
  classroomId: z.string(),
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

  const { classroomId, students: studentStatuses } = parsed.data;
  const date = format(new Date(), 'yyyy-MM-dd');

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
