import HomeForm from "@/components/home-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getClassrooms } from "@/lib/data";

export default async function Home() {
  const classrooms = await getClassrooms();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-background to-blue-100">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold font-headline text-primary tracking-tight">
            AsistenciaFácil
          </h1>
          <CardDescription className="pt-2 text-base">
            Seleccione un salón para comenzar a registrar la asistencia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomeForm classrooms={classrooms} />
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AsistenciaFácil. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
