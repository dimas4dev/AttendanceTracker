import type { Classroom, Student, AttendanceRecord } from './types';

export const CLASSROOMS: Classroom[] = [
  { id: 'capacitacion-destino-1a', name: 'CAPACITACIÓN DESTINO 1A' },
  { id: 'capacitacion-destino-1b', name: 'CAPACITACIÓN DESTINO 1B' },
  { id: 'capacitacion-destino-2a', name: 'CAPACITACIÓN DESTINO 2A' },
  { id: 'capacitacion-destino-2b', name: 'CAPACITACIÓN DESTINO 2B' },
  { id: 'capacitacion-destino-3', name: 'CAPACITACIÓN DESTINO 3' },
  { id: 'escuela-ministerial-1', name: 'ESCUELA MINISTERIAL 1' },
  { id: 'escuela-ministerial-2a', name: 'ESCUELA MINISTERIAL 2A' },
  { id: 'escuela-ministerial-2b', name: 'ESCUELA MINISTERIAL 2B' },
  { id: 'escuela-ministerial-3', name: 'ESCUELA MINISTERIAL 3' },
];

const allStudents: Student[] = [
  { id: 's1', name: 'Juan Pérez', document: '12345' },
  { id: 's2', name: 'Ana García', document: '23456' },
  { id: 's3', name: 'Luis Rodríguez', document: '34567' },
  { id: 's4', name: 'María Fernández', document: '45678' },
  { id: 's5', name: 'Carlos López', document: '56789' },
  { id: 's6', name: 'Laura Martínez', document: '67890' },
  { id: 's7', name: 'Pedro Gómez', document: '78901' },
  { id: 's8', name: 'Sofía Sánchez', document: '89012' },
  { id: 's9', name: 'Miguel Torres', document: '90123' },
  { id: 's10', name: 'Elena Ramírez', document: '10234' },
  { id: 's11', name: 'David Jiménez', document: '11345' },
  { id: 's12', name: 'Lucía Vázquez', document: '12456' },
  { id: 's13', name: 'Daniela Castro', document: '13567' },
  { id: 's14', name: 'Jorge Romero', document: '14678' },
  { id: 's15', name: 'Valeria Flores', document: '15789' },
  { id: 's16', name: 'Pablo Ortiz', document: '16890' },
  { id: 's17', name: 'Adriana Navarro', document: '17901' },
  { id: 's18', name: 'Mateo Gutiérrez', document: '18012' },
  { id: 's19', name: 'Camila Medina', document: '19123' },
  { id: 's20', name: 'Sergio Vargas', document: '20234' },
];

export const STUDENTS_BY_CLASSROOM: Record<string, Student[]> = {
  'capacitacion-destino-1a': allStudents.slice(0, 5),
  'capacitacion-destino-1b': allStudents.slice(5, 10),
  'capacitacion-destino-2a': allStudents.slice(10, 15),
  'capacitacion-destino-2b': allStudents.slice(15, 20),
  'capacitacion-destino-3': allStudents.slice(0, 8),
  'escuela-ministerial-1': allStudents.slice(8, 16),
  'escuela-ministerial-2a': allStudents.slice(3, 11),
  'escuela-ministerial-2b': allStudents.slice(12, 18),
  'escuela-ministerial-3': allStudents.slice(0, 10),
};

export const ATTENDANCE_HISTORY: Record<string, AttendanceRecord[]> = {
  'capacitacion-destino-1a': [
    { date: '2023-10-01', present: ['s1', 's2', 's4'], absent: ['s3', 's5'] },
    { date: '2023-10-08', present: ['s1', 's2', 's3', 's4', 's5'], absent: [] },
  ],
  'capacitacion-destino-1b': [
    { date: '2023-10-01', present: ['s6', 's8', 's9'], absent: ['s7', 's10'] },
  ],
  // Add more history for other classrooms if needed
};
