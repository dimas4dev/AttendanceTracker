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

export async function updateAttendanceDateClient(
  classroomId: string,
  oldDate: string,
  newDate: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validar que la nueva fecha no sea futura
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const selectedDate = new Date(newDate + 'T00:00:00');
    
    if (selectedDate > today) {
      return { success: false, message: 'No se puede cambiar la fecha a una fecha futura.' };
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newDate)) {
      return { success: false, message: 'Formato de fecha inválido.' };
    }

    // Buscar el registro con la fecha antigua
    const oldDateQuery = query(
      collection(db, 'asistencias'),
      where('classroomId', '==', classroomId),
      where('date', '==', oldDate)
    );

    const oldDateSnapshot = await getDocs(oldDateQuery);

    if (oldDateSnapshot.empty) {
      return { success: false, message: 'No se encontró el registro de asistencia para esta fecha.' };
    }

    // Verificar si ya existe un registro con la nueva fecha
    const newDateQuery = query(
      collection(db, 'asistencias'),
      where('classroomId', '==', classroomId),
      where('date', '==', newDate)
    );

    const newDateSnapshot = await getDocs(newDateQuery);

    if (!newDateSnapshot.empty) {
      return { 
        success: false, 
        message: `Ya existe un registro de asistencia para la fecha ${newDate}. Por favor, elimina o edita ese registro primero.` 
      };
    }

    // Actualizar la fecha del documento
    const docRef = oldDateSnapshot.docs[0].ref;
    await updateDoc(docRef, {
      date: newDate,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'Fecha de asistencia actualizada correctamente.' };
  } catch (error) {
    console.error('Error updating attendance date:', error);
    return { success: false, message: 'Error al actualizar la fecha de asistencia.' };
  }
}
