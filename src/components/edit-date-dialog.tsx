'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EditDateDialogProps {
  currentDate: string;
  onConfirm: (newDate: string) => Promise<void>;
  triggerText?: string;
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function EditDateDialog({
  currentDate,
  onConfirm,
  triggerText = 'Editar',
  triggerVariant = 'outline',
  triggerSize = 'sm',
  children
}: EditDateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newDate, setNewDate] = useState(currentDate);
  const [error, setError] = useState<string>('');

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewDate(currentDate);
      setError('');
    }
    setIsOpen(open);
  };

  const handleConfirm = async () => {
    try {
      setError('');
      
      // Validar que la fecha no esté vacía
      if (!newDate) {
        setError('Por favor selecciona una fecha');
        return;
      }

      // Validar que la fecha no sea futura
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const selectedDate = new Date(newDate + 'T00:00:00');
      
      if (selectedDate > today) {
        setError('No se puede cambiar la fecha a una fecha futura');
        return;
      }

      // Validar que la fecha haya cambiado
      if (newDate === currentDate) {
        setError('Por favor selecciona una fecha diferente');
        return;
      }

      setIsLoading(true);
      await onConfirm(newDate);
      setIsOpen(false);
      setNewDate(currentDate);
      setError('');
    } catch (error) {
      console.error('Error during date update:', error);
      setError('Error al actualizar la fecha. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const formattedCurrentDate = format(new Date(currentDate + 'T00:00:00'), "eeee, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={triggerVariant} size={triggerSize}>
            <Edit className="h-4 w-4" />
            {triggerText && triggerText !== 'Editar' && triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Editar Fecha de Asistencia
          </DialogTitle>
          <DialogDescription>
            Cambia la fecha del registro de asistencia. La fecha actual es <strong>{formattedCurrentDate}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-date">Nueva Fecha</Label>
            <Input
              id="new-date"
              type="date"
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                setError('');
              }}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full"
            />
            {newDate && newDate !== currentDate && (
              <p className="text-sm text-muted-foreground">
                Nueva fecha: {format(new Date(newDate + 'T00:00:00'), "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || newDate === currentDate}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Actualizando...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Actualizar Fecha
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
