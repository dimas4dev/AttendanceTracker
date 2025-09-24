export type Classroom = {
  id: string;
  name: string;
};

export type Student = {
  id: string;
  name: string;
  document: string;
};

export type AttendanceRecord = {
  date: string; // YYYY-MM-DD
  present: string[]; // array of student ids
  absent: string[]; // array of student ids
};

export type Novelty = {
  id: string;
  classroomId: string;
  studentName: string;
  studentDocument: string;
  reason: string;
  createdAt: string;
  createdBy?: string;
};
