import { findClassroomBySlug, getStudentsByClassroom, getAttendanceHistory } from '@/lib/data';
import AttendanceForm from './_components/attendance-form';
import AttendanceHistory from './_components/attendance-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notFound } from 'next/navigation';
import { Users, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ClassroomPage({ params }: { params: { slug: string } }) {
  const classroom = await findClassroomBySlug(params.slug);

  if (!classroom) {
    notFound();
  }

  const students = await getStudentsByClassroom(classroom.id);
  const history = await getAttendanceHistory(classroom.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-100 p-4 sm:p-6 md:p-8">
       <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
            <div className='animate-in fade-in slide-in-from-left duration-500'>
                 <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary tracking-tight">
                    {classroom.name}
                </h1>
                <p className="text-muted-foreground mt-1">{students.length} estudiantes en este salón.</p>
            </div>
            <Button asChild variant="outline" className='animate-in fade-in slide-in-from-right duration-500'>
                <Link href="/">
                    Cambiar de Salón
                </Link>
            </Button>
        </div>

        <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="attendance" className="h-full text-base gap-2">
                    <Users className="h-5 w-5" />
                    Tomar Asistencia
                </TabsTrigger>
                <TabsTrigger value="history" className="h-full text-base gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Historial
                </TabsTrigger>
            </TabsList>
            <TabsContent value="attendance">
                <Card className="mt-4 shadow-lg rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Lista de Estudiantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AttendanceForm students={students} classroomId={classroom.id} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="history">
                 <Card className="mt-4 shadow-lg rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Historial de Asistencia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AttendanceHistory history={history} classroomId={classroom.id} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
