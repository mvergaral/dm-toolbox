import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      {/* Columna Izquierda: Menú */}
      <Sidebar />

      {/* Columna Derecha: Área de Trabajo */}
      <main className="flex-1 overflow-auto relative flex flex-col">
        {/* Aquí renderizaremos las diferentes vistas (Mapas, Combate, etc.) */}
        {children}
      </main>
    </div>
  );
}
