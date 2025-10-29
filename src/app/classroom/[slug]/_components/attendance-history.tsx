'use client';

import { useState, useEffect } from 'react';
import { getStudentsByClassroom } from '@/lib/data';
import { removeStudentFromAbsentListClient, deleteAttendanceDayClient, updateAttendanceDateClient } from '@/lib/client-data';
import { type AttendanceRecord, type Student } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, UserX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { EditDateDialog } from '@/components/edit-date-dialog';
import { useToast } from '@/hooks/use-toast';


interface AttendanceHistoryProps {
  history: AttendanceRecord[];
  classroomId: string;
}

interface ProcessedRecord {
  date: string;
  formattedDate: string;
  absentCount: number;
  absentNames: string;
  absentStudents: Array<{ id: string; name: string }>;
}

export default function AttendanceHistory({ history, classroomId }: AttendanceHistoryProps) {
  const [processedHistory, setProcessedHistory] = useState<ProcessedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const allStudents = await getStudentsByClassroom(classroomId);
        setStudents(allStudents);
        
        if (allStudents.length > 0) {
          const studentMap = new Map(allStudents.map(s => [s.id, s.name]));
          
          const processed = history.map(record => {
            const absentStudents = record.absent.map(id => ({
              id,
              name: studentMap.get(id) || 'Estudiante Desconocido'
            }));
            
            const absentNames = absentStudents.map(s => s.name).join(', ');
            const formattedDate = format(parseISO(record.date), "eeee, d 'de' MMMM 'de' yyyy", { locale: es });
            
            return {
              date: record.date,
              formattedDate,
              absentCount: record.absent.length,
              absentNames: absentNames || 'Ninguno',
              absentStudents,
            };
          }).sort((a, b) => b.date.localeCompare(a.date));
          
          setProcessedHistory(processed);
        }
      } catch (error) {
        console.error('Error loading attendance history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [history, classroomId]);

  const handleRemoveAbsence = async (date: string, studentId: string, studentName: string) => {
    try {
      const result = await removeStudentFromAbsentListClient(classroomId, date, studentId);
      
      if (result.success) {
        // Actualizar el estado local
        setProcessedHistory(prev => prev.map(record => {
          if (record.date === date) {
            const updatedAbsentStudents = record.absentStudents.filter(s => s.id !== studentId);
            const updatedAbsentNames = updatedAbsentStudents.map(s => s.name).join(', ');
            
            return {
              ...record,
              absentCount: updatedAbsentStudents.length,
              absentNames: updatedAbsentNames || 'Ninguno',
              absentStudents: updatedAbsentStudents,
            };
          }
          return record;
        }));
        
        toast({
          title: "Inasistencia eliminada",
          description: `La inasistencia de ${studentName} ha sido eliminada correctamente.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing absence:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la inasistencia. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDay = async (date: string) => {
    try {
      const result = await deleteAttendanceDayClient(classroomId, date);
      if (result.success) {
        setProcessedHistory(prev => prev.filter(record => record.date !== date));
        toast({
          title: 'Día eliminado',
          description: 'El registro de asistencia de ese día fue eliminado.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting attendance day:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el día de asistencia. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateDate = async (oldDate: string, newDate: string) => {
    try {
      const result = await updateAttendanceDateClient(classroomId, oldDate, newDate);
      
      if (result.success) {
        // Actualizar el historial procesado con la nueva fecha
        setProcessedHistory(prev => prev.map(record => {
          if (record.date === oldDate) {
            const newDateObj = new Date(newDate + 'T00:00:00');
            const formattedDate = format(newDateObj, "eeee, d 'de' MMMM 'de' yyyy", { locale: es });
            return {
              ...record,
              date: newDate,
              formattedDate,
            };
          }
          return record;
        }).sort((a, b) => b.date.localeCompare(a.date)));
        
        toast({
          title: 'Fecha actualizada',
          description: `La fecha se ha actualizado correctamente a ${format(new Date(newDate + 'T00:00:00'), "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}.`,
        });
        
        // Recargar la página para actualizar el historial completo
        window.location.reload();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating date:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la fecha. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Alert>
        <CalendarIcon className="h-4 w-4" />
        <AlertTitle>Cargando...</AlertTitle>
        <AlertDescription>
          Cargando historial de asistencia...
        </AlertDescription>
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Alert>
        <CalendarIcon className="h-4 w-4" />
        <AlertTitle>Sin Registros</AlertTitle>
        <AlertDescription>
          Aún no hay historial de asistencia para este salón.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {processedHistory.map((record) => (
        <AccordionItem key={record.date} value={record.date}>
          <AccordionTrigger className="text-base hover:no-underline">
            <div className='flex items-center justify-between w-full pr-4 gap-3'>
              <span className="flex-1 text-left">{record.formattedDate}</span>
              <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {record.absentCount} Ausente(s)
              </span>
              <div className="flex items-center gap-2">
                <EditDateDialog
                  currentDate={record.date}
                  onConfirm={(newDate) => handleUpdateDate(record.date, newDate)}
                  triggerVariant="ghost"
                  triggerSize="sm"
                />
                <DeleteConfirmationDialog
                  title="Eliminar Día de Asistencia"
                  description={"¿Estás seguro de eliminar completamente el registro de asistencia de este día? Esta acción no se puede deshacer."}
                  onConfirm={() => handleDeleteDay(record.date)}
                  triggerVariant="ghost"
                  triggerSize="sm"
                />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-start gap-3 text-base p-2 bg-secondary/30 rounded-md">
                <UserX className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-secondary-foreground mb-2">Estudiantes Ausentes:</p>
                  <div className="space-y-1">
                    {record.absentStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-background rounded-md border">
                        <span className="text-muted-foreground">{student.name}</span>
                        <DeleteConfirmationDialog
                          title="Eliminar Inasistencia"
                          description={`¿Estás seguro de que quieres eliminar la inasistencia de ${student.name} para esta fecha? Esta acción marcará al estudiante como presente.`}
                          onConfirm={() => handleRemoveAbsence(record.date, student.id, student.name)}
                          triggerVariant="ghost"
                          triggerSize="sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
