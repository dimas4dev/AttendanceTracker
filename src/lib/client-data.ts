'use client';

import { db } from './firebase';
import { 
  collection, 
  getDocs, 
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
