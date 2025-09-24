'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveNovelty } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertTriangle } from 'lucide-react';
import type { Classroom } from '@/lib/types';

const noveltySchema = z.object({
  classroomId: z.string().min(1, 'Debe seleccionar un salón'),
  studentName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  studentDocument: z.string().min(6, 'El documento debe tener al menos 6 caracteres'),
  reason: z.string().min(10, 'La razón debe tener al menos 10 caracteres'),
});

type NoveltyFormData = z.infer<typeof noveltySchema>;

interface NoveltyModalProps {
  classrooms: Classroom[];
  onNoveltySaved?: () => void;
}

export function NoveltyModal({ classrooms, onNoveltySaved }: NoveltyModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<NoveltyFormData>({
    resolver: zodResolver(noveltySchema),
    defaultValues: {
      classroomId: '',
      studentName: '',
      studentDocument: '',
      reason: '',
    },
  });

  const onSubmit = async (data: NoveltyFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await saveNovelty({
        classroomId: data.classroomId,
        studentName: data.studentName.trim(),
        studentDocument: data.studentDocument.trim(),
        reason: data.reason.trim(),
        createdBy: 'Usuario',
      });

      if (result.success) {
        toast({
          title: 'Novedad registrada',
          description: result.message,
          variant: 'default',
        });
        
        form.reset();
        setOpen(false);
        onNoveltySaved?.();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado al registrar la novedad',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Registrar Novedad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registrar Nueva Novedad
          </DialogTitle>
          <DialogDescription>
            Registra información sobre estudiantes que no están en la lista o cualquier novedad importante.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salón</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un salón" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Estudiante</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre completo del estudiante" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación del Estudiante</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Número de documento o cédula" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón de la Novedad</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe la razón de la novedad (ej: estudiante no aparece en la lista, llegó tarde, etc.)"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar Novedad'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
