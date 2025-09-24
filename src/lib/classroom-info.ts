'use server';
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface ClassroomInfo {
  id: string;
  name: string;
  roomNumber: string;
  courseType: string;
  courseLevel: string;
  studentCount: number;
  lastAttendanceDate?: string;
  createdAt: string;
}

export async function getClassroomsWithInfo(): Promise<ClassroomInfo[]> {
  try {
    // Get all classrooms
    const classroomsSnapshot = await getDocs(collection(db, 'salones'));
    const classrooms: ClassroomInfo[] = [];

    for (const doc of classroomsSnapshot.docs) {
      const data = doc.data();
      
      // Count students in this classroom
      const studentsQuery = query(
        collection(db, 'estudiantes'),
        where('classroomId', '==', doc.id)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      
      // Get last attendance date
      const attendanceQuery = query(
        collection(db, 'asistencias'),
        where('classroomId', '==', doc.id)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      
      let lastAttendanceDate: string | undefined;
      if (!attendanceSnapshot.empty) {
        const attendanceDocs = attendanceSnapshot.docs.map(d => ({
          date: d.data().date,
          createdAt: d.data().createdAt
        }));
        attendanceDocs.sort((a, b) => b.date.localeCompare(a.date));
        lastAttendanceDate = attendanceDocs[0].date;
      }

      classrooms.push({
        id: doc.id,
        name: data.name,
        roomNumber: data.roomNumber,
        courseType: data.courseType,
        courseLevel: data.courseLevel,
        studentCount: studentsSnapshot.size,
        lastAttendanceDate,
        createdAt: data.createdAt,
      });
    }

    return classrooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  } catch (error) {
    console.error('Error getting classrooms info:', error);
    throw new Error('Error al obtener información de los salones');
  }
}
