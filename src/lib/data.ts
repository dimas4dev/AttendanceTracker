'use server';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import type { Classroom, Student, AttendanceRecord, Novelty } from './types';
import { slugify } from './utils';

// Collections
const CLASSROOMS_COLLECTION = 'salones';
const STUDENTS_COLLECTION = 'estudiantes';
const ATTENDANCE_COLLECTION = 'asistencias';
const NOVELTIES_COLLECTION = 'novedades';

// Classroom operations
export async function getClassrooms(): Promise<Classroom[]> {
  try {
    const querySnapshot = await getDocs(collection(db, CLASSROOMS_COLLECTION));
    const classrooms: Classroom[] = [];
    
    querySnapshot.forEach((doc) => {
      classrooms.push({
        id: doc.id,
        name: doc.data().name,
      });
    });
    
    return classrooms.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting classrooms:', error);
    throw new Error('Error al obtener los salones');
  }
}

export async function findClassroomBySlug(slug: string): Promise<Classroom | undefined> {
  try {
    const classrooms = await getClassrooms();
    return classrooms.find(c => slugify(c.name) === slug);
  } catch (error) {
    console.error('Error finding classroom by slug:', error);
    return undefined;
  }
}

export async function findClassroomById(id: string): Promise<Classroom | undefined> {
  try {
    const docRef = doc(db, CLASSROOMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        name: docSnap.data().name,
      };
    }
    return undefined;
  } catch (error) {
    console.error('Error finding classroom by id:', error);
    return undefined;
  }
}

// Student operations
export async function getStudentsByClassroom(classroomId: string): Promise<Student[]> {
  try {
    const q = query(
      collection(db, STUDENTS_COLLECTION),
      where('classroomId', '==', classroomId)
      // orderBy('name') // Comentado temporalmente hasta crear el índice
    );
    
    const querySnapshot = await getDocs(q);
    const students: Student[] = [];
    
    querySnapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        name: doc.data().name,
        document: doc.data().document || '',
      });
    });
    
    // Ordenar por nombre en el código (ya que no podemos usar orderBy sin índice)
    return students.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting students:', error);
    throw new Error('Error al obtener los estudiantes');
  }
}

// Attendance operations
export async function getAttendanceHistory(classroomId: string): Promise<AttendanceRecord[]> {
  try {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classroomId', '==', classroomId)
      // orderBy('date', 'desc') // Comentado temporalmente hasta crear el índice
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
    
    // Ordenar por fecha en el código (ya que no podemos usar orderBy sin índice)
    return records.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error getting attendance history:', error);
    throw new Error('Error al obtener el historial de asistencia');
  }
}

export async function saveAttendanceRecord(
  classroomId: string, 
  record: AttendanceRecord
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if attendance already exists for this date
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classroomId', '==', classroomId),
      where('date', '==', record.date)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing record
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        present: record.present,
        absent: record.absent,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, message: 'Asistencia actualizada correctamente.' };
    } else {
      // Create new record
      await addDoc(collection(db, ATTENDANCE_COLLECTION), {
        classroomId,
        date: record.date,
        present: record.present,
        absent: record.absent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, message: 'Asistencia registrada correctamente.' };
    }
  } catch (error) {
    console.error('Error saving attendance record:', error);
    return { success: false, message: 'Error al guardar la asistencia.' };
  }
}

// Novelty operations
export async function saveNovelty(novelty: Omit<Novelty, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
  try {
    await addDoc(collection(db, NOVELTIES_COLLECTION), {
      classroomId: novelty.classroomId,
      studentName: novelty.studentName,
      studentDocument: novelty.studentDocument,
      reason: novelty.reason,
      createdBy: novelty.createdBy || 'Sistema',
      createdAt: serverTimestamp(),
    });

    return { success: true, message: 'Novedad registrada correctamente.' };
  } catch (error) {
    console.error('Error saving novelty:', error);
    return { success: false, message: 'Error al guardar la novedad.' };
  }
}

export async function getNoveltiesByClassroom(classroomId: string): Promise<Novelty[]> {
  try {
    const q = query(
      collection(db, NOVELTIES_COLLECTION),
      where('classroomId', '==', classroomId)
      // orderBy('createdAt', 'desc') // Comentado temporalmente hasta crear el índice
    );
    
    const querySnapshot = await getDocs(q);
    const novelties: Novelty[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      novelties.push({
        id: doc.id,
        classroomId: data.classroomId,
        studentName: data.studentName,
        studentDocument: data.studentDocument,
        reason: data.reason,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdBy: data.createdBy,
      });
    });
    
    // Ordenar por fecha en el código (ya que no podemos usar orderBy sin índice)
    return novelties.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('Error getting novelties:', error);
    throw new Error('Error al obtener las novedades');
  }
}

export async function deleteNovelty(noveltyId: string): Promise<{ success: boolean; message: string }> {
  try {
    await deleteDoc(doc(db, NOVELTIES_COLLECTION, noveltyId));
    return { success: true, message: 'Novedad eliminada correctamente.' };
  } catch (error) {
    console.error('Error deleting novelty:', error);
    return { success: false, message: 'Error al eliminar la novedad.' };
  }
}

export async function removeStudentFromAbsentList(
  classroomId: string, 
  date: string, 
  studentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Buscar el registro de asistencia para la fecha específica
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classroomId', '==', classroomId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, message: 'No se encontró el registro de asistencia para esta fecha.' };
    }
    
    const docRef = querySnapshot.docs[0].ref;
    const currentData = querySnapshot.docs[0].data();
    
    // Remover el estudiante de la lista de ausentes
    const updatedAbsent = currentData.absent.filter((id: string) => id !== studentId);
    
    // Actualizar el documento
    await updateDoc(docRef, {
      absent: updatedAbsent,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, message: 'Inasistencia eliminada correctamente.' };
  } catch (error) {
    console.error('Error removing student from absent list:', error);
    return { success: false, message: 'Error al eliminar la inasistencia.' };
  }
}
