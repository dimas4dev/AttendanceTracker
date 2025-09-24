import { getStudentsByClassroom } from '@/lib/data';
import { type AttendanceRecord } from '@/lib/types';
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


interface AttendanceHistoryProps {
  history: AttendanceRecord[];
  classroomId: string;
}

// Helper function to process all records at once
async function processHistory(history: AttendanceRecord[], classroomId: string) {
    const allStudents = await getStudentsByClassroom(classroomId);
    if (!allStudents.length) return [];
    
    const studentMap = new Map(allStudents.map(s => [s.id, s.name]));

    return history.map(record => {
        const absentNames = record.absent.map(id => studentMap.get(id) || 'Estudiante Desconocido').join(', ');
        const formattedDate = format(parseISO(record.date), "eeee, d 'de' MMMM 'de' yyyy", { locale: es });
        return {
            date: record.date,
            formattedDate,
            absentCount: record.absent.length,
            absentNames: absentNames || 'Ninguno',
        };
    }).sort((a, b) => b.date.localeCompare(a.date));
}

export default async function AttendanceHistory({ history, classroomId }: AttendanceHistoryProps) {
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

  const processedHistory = await processHistory(history, classroomId);

  return (
    <Accordion type="single" collapsible className="w-full">
      {processedHistory.map((record) => (
          <AccordionItem key={record.date} value={record.date}>
            <AccordionTrigger className="text-base hover:no-underline">
                <div className='flex items-center justify-between w-full pr-4'>
                    <span>{record.formattedDate}</span>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {record.absentCount} Ausente(s)
                    </span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex items-start gap-3 text-base p-2 bg-secondary/30 rounded-md">
                    <UserX className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-secondary-foreground">Estudiantes Ausentes:</p>
                        <p className="text-muted-foreground">{record.absentNames}</p>
                    </div>
                </div>
            </AccordionContent>
          </AccordionItem>
        ))}
    </Accordion>
  );
}
