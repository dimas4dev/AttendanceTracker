'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNoveltiesByClassroomClient } from '@/lib/client-data';
import { Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import type { Novelty } from '@/lib/types';

interface NoveltiesListProps {
  classroomId: string;
}

export function NoveltiesList({ classroomId }: NoveltiesListProps) {
  const [novelties, setNovelties] = useState<Novelty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNovelties = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNoveltiesByClassroomClient(classroomId);
        setNovelties(data);
      } catch (err) {
        setError('Error al cargar las novedades');
        console.error('Error loading novelties:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNovelties();
  }, [classroomId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Novedades Registradas
          </CardTitle>
          <CardDescription>
            Historial de novedades para este salón
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando novedades...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Novedades Registradas
          </CardTitle>
          <CardDescription>
            Historial de novedades para este salón
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (novelties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Novedades Registradas
          </CardTitle>
          <CardDescription>
            Historial de novedades para este salón
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay novedades registradas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Las novedades aparecerán aquí cuando se registren
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Novedades Registradas
          <Badge variant="secondary">{novelties.length}</Badge>
        </CardTitle>
        <CardDescription>
          Historial de novedades para este salón
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {novelties.map((novelty) => (
            <div 
              key={novelty.id} 
              className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {novelty.studentName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {novelty.studentDocument}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(novelty.createdAt).toLocaleDateString('es-CO')}
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-orange-600 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {novelty.reason}
                </p>
              </div>
              
              {novelty.createdBy && (
                <div className="mt-2 pt-2 border-t border-yellow-200">
                  <p className="text-xs text-gray-500">
                    Registrado por: <span className="font-medium">{novelty.createdBy}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
