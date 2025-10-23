'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Loader2, PartyPopper, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type Student } from '@/lib/types';
import { saveAttendance } from '../actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AttendanceFormProps {
  students: Student[];
  classroomId: string;
}

const FormSchema = z.object({
  attendanceDate: z.string().min(1, 'La fecha es obligatoria'),
  students: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      absent: z.boolean(),
    })
  ),
});

export default function AttendanceForm({ students, classroomId }: AttendanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      attendanceDate: format(new Date(), 'yyyy-MM-dd'),
      students: students.map(s => ({ id: s.id, name: s.name, absent: false })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'students',
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    const formData = {
      classroomId,
      attendanceDate: data.attendanceDate,
      students: data.students,
    };
    const result = await saveAttendance(students, formData);
    
    setDialogMessage(result.message);
    setDialogOpen(true);
    setIsSubmitting(false);
  }
  
  const selectedDate = form.watch('attendanceDate');
  const formattedDate = selectedDate ? format(new Date(selectedDate + 'T00:00:00'), "eeee, d 'de' MMMM 'de' yyyy", { locale: es }) : '';

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
             <p className="font-semibold text-secondary-foreground mb-3">Fecha de asistencia:</p>
             
             <FormField
               control={form.control}
               name="attendanceDate"
               render={({ field }) => (
                 <FormItem>
                   <FormControl>
                     <div className="flex flex-col items-center space-y-2">
                       <Input
                         type="date"
                         {...field}
                         className="text-center text-base border-primary/20 focus:border-primary w-auto"
                         max={format(new Date(), 'yyyy-MM-dd')}
                       />
                       <p className="text-sm text-muted-foreground">
                         Fecha seleccionada: <span className="font-medium text-primary">{formattedDate || 'Selecciona una fecha'}</span>
                       </p>
                     </div>
                   </FormControl>
                 </FormItem>
               )}
             />
             
             <p className="text-sm text-muted-foreground mt-3">Marque la casilla si el estudiante está ausente.</p>
          </div>
          <ScrollArea className="h-72 w-full pr-4">
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={`students.${index}.absent`}
                        render={({ field: checkboxField }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card hover:bg-accent/20 transition-colors">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">{field.name}</FormLabel>
                                </div>
                                <FormControl>
                                    <Checkbox
                                        checked={checkboxField.value}
                                        onCheckedChange={checkboxField.onChange}
                                        aria-label={`Marcar a ${field.name} como ausente`}
                                        className="h-6 w-6"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
            </div>
          </ScrollArea>
           <Separator />
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
                <>
                <Check className="mr-2 h-5 w-5" />
                Registrar Asistencia
              </>
            )}
          </Button>
        </form>
      </Form>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <PartyPopper className="h-6 w-6 text-accent-foreground" />
            </div>
            <AlertDialogTitle className="text-center">Confirmación</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
