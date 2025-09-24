'use client';

import { NoveltyModal } from './novelty-modal';
import type { Classroom } from '@/lib/types';

interface NoveltyModalWrapperProps {
  classrooms: Classroom[];
}

export function NoveltyModalWrapper({ classrooms }: NoveltyModalWrapperProps) {
  const handleNoveltySaved = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <NoveltyModal 
      classrooms={classrooms} 
      onNoveltySaved={handleNoveltySaved}
    />
  );
}
