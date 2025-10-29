'use client';

import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query, 
  where 
} from 'firebase/firestore';
import type { Novelty } from './types';

// Collections
const NOVELTIES_COLLECTION = 'novedades';

// Client-side novelty operations
export async function getNoveltiesByClassroomClient(classroomId: string): Promise<Novelty[]> {
  try {
    const q = query(
      collection(db, NOVELTIES_COLLECTION),
      where('classroomId', '==', classroomId)
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
    
    // Ordenar por fecha en el código
    return novelties.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('Error getting novelties:', error);
    throw new Error('Error al obtener las novedades');
  }
}

export async function deleteNoveltyClient(noveltyId: string): Promise<{ success: boolean; message: string }> {
  try {
    await deleteDoc(doc(db, NOVELTIES_COLLECTION, noveltyId));
    return { success: true, message: 'Novedad eliminada correctamente.' };
  } catch (error) {
    console.error('Error deleting novelty:', error);
    return { success: false, message: 'Error al eliminar la novedad.' };
  }
}

export async function removeStudentFromAbsentListClient(
  classroomId: string, 
  date: string, 
  studentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Buscar el registro de asistencia para la fecha específica
    const q = query(
      collection(db, 'asistencias'),
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

export async function deleteAttendanceDayClient(
  classroomId: string,
  date: string
): Promise<{ success: boolean; message: string }> {
  try {
    const q = query(
      collection(db, 'asistencias'),
      where('classroomId', '==', classroomId),
      where('date', '==', date)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'No se encontró el registro de asistencia para esta fecha.' };
    }

    const docRef = querySnapshot.docs[0].ref;
    await deleteDoc(docRef);

    return { success: true, message: 'Día de asistencia eliminado correctamente.' };
  } catch (error) {
    console.error('Error deleting attendance day:', error);
    return { success: false, message: 'Error al eliminar el día de asistencia.' };
  }
}
