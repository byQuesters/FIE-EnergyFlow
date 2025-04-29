// pages/building/[id].tsx
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function BuildingDetail() {
  const router = useRouter();
  const { id } = router.query;

  // Datos simulados del edificio
  const buildingData = {
    id,
    name: id,
    energyPlan: "Energy Plan Personalizado",
    energyStorage: "Energy Storage Avanzado",
    capacity: "80% Capacity",
    mainPower: "Main Power 60%",
    greenEnergy: "Green Energy 40%",
    lastUpdated: "2023-05-15",
    consumptionTrend: "Decreciente",
    efficiencyRating: "A+"
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Detalles de {buildingData.name}</title>
      </Head>

      <main className="container mx-auto p-4">
        <button 
          onClick={() => router.back()}
          className="mb-4 text-blue-500 hover:text-blue-700"
        >
          &larr; Volver al mapa
        </button>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">{buildingData.name} - Detalles completos</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Información Energética</h2>
              <div className="space-y-3">
                <p><span className="font-medium">Plan Energético:</span> {buildingData.energyPlan}</p>
                <p><span className="font-medium">Almacenamiento:</span> {buildingData.energyStorage}</p>
                <p><span className="font-medium">Capacidad:</span> {buildingData.capacity}</p>
                <p><span className="font-medium">Energía Principal:</span> {buildingData.mainPower}</p>
                <p><span className="font-medium">Energía Verde:</span> {buildingData.greenEnergy}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
              <div className="space-y-3">
                <p><span className="font-medium">Última actualización:</span> {buildingData.lastUpdated}</p>
                <p><span className="font-medium">Tendencia de consumo:</span> {buildingData.consumptionTrend}</p>
                <p><span className="font-medium">Calificación de eficiencia:</span> {buildingData.efficiencyRating}</p>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="font-medium text-yellow-800">Modo Eficiencia Energética</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This mode will help to extend the power storage efficiency.
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos o visualizaciones adicionales podrían ir aquí */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Consumo Histórico</h2>
            <div className="bg-gray-100 h-64 flex items-center justify-center text-gray-400">
              [Área para gráficos de consumo]
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}