'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Loader2, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
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
      students: data.students,
    };
    const result = await saveAttendance(students, formData);
    
    setDialogMessage(result.message);
    setDialogOpen(true);
    setIsSubmitting(false);
  }
  
  const today = format(new Date(), "eeee, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
             <p className="font-semibold text-secondary-foreground">Registrando asistencia para hoy:</p>
             <p className="text-lg font-bold text-primary">{today}</p>
             <p className="text-sm text-muted-foreground mt-1">Marque la casilla si el estudiante está ausente.</p>
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
