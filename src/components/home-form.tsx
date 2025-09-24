'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Classroom } from '@/lib/types';
import { slugify } from '@/lib/utils';

interface HomeFormProps {
  classrooms: Classroom[];
}

export default function HomeForm({ classrooms }: HomeFormProps) {
  const router = useRouter();
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  const handleGoToClassroom = () => {
    if (selectedClassroom) {
      router.push(`/classroom/${slugify(selectedClassroom)}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Select onValueChange={setSelectedClassroom} value={selectedClassroom}>
        <SelectTrigger className="w-full text-base h-12">
          <SelectValue placeholder="Seleccione un salón" />
        </SelectTrigger>
        <SelectContent>
          {classrooms.map((classroom) => (
            <SelectItem key={classroom.id} value={classroom.name}>
              {classroom.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleGoToClassroom}
        disabled={!selectedClassroom}
        className="w-full h-12 text-lg"
      >
        Ingresar
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
