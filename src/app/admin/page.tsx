'use server';
import { getClassroomsWithInfo } from '@/lib/classroom-info';

export default async function AdminPage() {
  const classrooms = await getClassroomsWithInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
        
        <div className="grid gap-6">
          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Configuración de Firebase</h2>
            <div className="bg-blue-100 text-blue-800 p-4 rounded-lg">
              <p className="font-medium mb-2">📋 Para poblar Firebase con los datos iniciales:</p>
              <p className="text-sm mb-2">1. Ejecuta el script: <code className="bg-blue-200 px-2 py-1 rounded">npm run populate-firebase</code></p>
              <p className="text-sm">2. Esto creará todos los salones, estudiantes y registros de asistencia de ejemplo</p>
            </div>
          </div>

          {/* Firebase Connection Test */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Estado de Conexión Firebase</h2>
            <div className="bg-blue-100 text-blue-800 p-4 rounded-lg">
              <p className="font-medium">
                ✅ Conexión exitosa a Firestore
              </p>
              <p className="text-sm mt-2">
                Salones configurados en Firebase: {classrooms.length}
              </p>
            </div>
          </div>

          {/* Classrooms List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Salones Configurados en Firebase</h2>
            <div className="grid gap-3">
              {classrooms.map((classroom) => (
                <div key={classroom.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900">{classroom.name}</h3>
                      <p className="text-sm text-blue-700">{classroom.courseType} {classroom.courseLevel}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {classroom.roomNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>👥 {classroom.studentCount} estudiantes</span>
                    {classroom.lastAttendanceDate && (
                      <span>📅 Última asistencia: {new Date(classroom.lastAttendanceDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Navegación</h2>
            <div className="space-y-2">
              <a 
                href="/" 
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🏠 Ir a la Página Principal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
