📜 DM Toolbox: Documento de Especificación del Proyecto

Versión: 1.0 Estado: En Desarrollo (MVP) Stack: Electron + React + TypeScript + RxDB
1. Visión del Producto

DM Toolbox es una aplicación de escritorio local-first diseñada para Game Masters (DM) de juegos de rol (como D&D, Pathfinder). Su objetivo es facilitar la gestión de campañas, el seguimiento de combates y la proyección de mapas en tiempo real sin depender de conexión a internet.

La característica distintiva es su sistema de Doble Ventana: una ventana de control para el DM (con secretos y herramientas) y una segunda ventana de proyección para los jugadores (mostrando solo lo que deben ver, como mapas y niebla de guerra).
2. Requisitos Funcionales (RF)

Son las funciones que el sistema debe realizar.
Módulo 1: Gestión de Sistema y Datos
ID	Requisito	Descripción
RF-SYS-01	Persistencia Local	El sistema debe guardar todos los datos automáticamente en el disco local usando RxDB/IndexedDB. No debe requerir botón de "Guardar".
RF-SYS-02	Modo Offline	La aplicación debe ser 100% funcional sin conexión a internet.
RF-SYS-03	Gestión de Ventanas	El sistema debe permitir abrir una "Ventana de Jugador" secundaria y detectar monitores externos para proyectarla en pantalla completa.
Módulo 2: Gestión de Campañas
ID	Requisito	Descripción
RF-CAM-01	Crear Campaña	El usuario puede crear una nueva campaña asignando nombre, sistema de juego y descripción.
RF-CAM-02	Listar Campañas	El dashboard debe mostrar todas las campañas existentes ordenadas por fecha de modificación.
RF-CAM-03	Eliminar Campaña	El usuario puede borrar una campaña (y sus datos asociados) previa confirmación.
Módulo 3: Combat Tracker (Rastreador de Combate)
ID	Requisito	Descripción
RF-CBT-01	Lista de Iniciativa	Permitir agregar actores (PJ y NPC) a una lista y ordenarlos numéricamente por su tirada de iniciativa.
RF-CBT-02	Control de Turnos	Debe haber un indicador visual de quién es el turno actual y permitir avanzar al siguiente.
RF-CBT-03	Gestión de Vida (HP)	El DM puede modificar la vida actual de cualquier actor (sumar curación o restar daño) rápidamente.
RF-CBT-04	Estados	Permitir asignar etiquetas de estado (ej: "Aturdido", "Envenenado") a los combatientes.
Módulo 4: Mapas y VTT (Virtual Tabletop)
ID	Requisito	Descripción
RF-MAP-01	Carga de Imágenes	El usuario debe poder importar imágenes locales (JPG, PNG) para usarlas como mapas.
RF-MAP-02	Tokens	Permitir colocar y arrastrar "fichas" (tokens) sobre el mapa que representen a los personajes/monstruos.
RF-MAP-03	Niebla de Guerra (Fog of War)	El mapa debe estar cubierto inicialmente por una capa negra. El DM debe tener una herramienta de "Pincel" para revelar áreas manualmente.
RF-MAP-04	Sincronización Visual	Cualquier cambio en el mapa (movimiento de token, revelado de niebla) debe reflejarse en tiempo real en la Ventana de Jugador.
RF-MAP-05	Grid (Rejilla)	Opción para superponer una cuadrícula configurable sobre la imagen del mapa.
Módulo 5: Base de Datos de NPCs
ID	Requisito	Descripción
RF-NPC-01	Ficha de NPC	Crear entradas para NPCs con campos: Nombre, Raza, Stats, Notas privadas e Imagen.
RF-NPC-02	Asociación	Los NPCs creados deben poder instanciarse rápidamente dentro del Combat Tracker.
3. Requisitos No Funcionales (RNF)

Son las propiedades de calidad del sistema (rendimiento, seguridad, usabilidad).
ID	Categoría	Descripción
RNF-01	Rendimiento	El movimiento de tokens y el dibujado en el mapa deben mantenerse a 60 FPS incluso con imágenes de alta resolución (4K).
RNF-02	Usabilidad	La interfaz debe usar un esquema de colores oscuros ("Dark Mode") por defecto para reducir la fatiga visual en sesiones nocturnas.
RNF-03	Escalabilidad	La arquitectura de la base de datos debe soportar futuras migraciones o sincronización con servidores en la nube sin reescribir el código base.
RNF-04	Portabilidad	Aunque el MVP es para Windows, el código no debe usar dependencias nativas exclusivas de Windows que impidan compilar para Linux/Mac o Web en el futuro.
RNF-05	Robustez	La aplicación debe manejar errores de base de datos (como bloqueos DB9) recuperándose automáticamente sin cerrar la app.
4. Estructura de Datos (Esquema Simplificado)

Para referencia técnica, estos son los objetos principales que maneja el sistema:
TypeScript

// Campaña
{
  id: string;          // UUID
  name: string;
  system: string;
  createdAt: number;
}

// Actor (NPC/Jugador)
{
  id: string;
  campaignId: string;  // Relación
  name: string;
  stats: { hp: number, ac: number, initiative: number };
  imagePath: string;
}

// Escena (Mapa)
{
  id: string;
  campaignId: string;
  imageSource: string; // Base64 o Path local
  fogOfWarData: any;   // Vector o Bitmap data de la niebla
  tokens: Array<{ x: number, y: number, actorId: string }>;
}

5. Roadmap (Futuro)

Funcionalidades fuera del alcance actual, pero consideradas para la arquitectura:

    Integración con IA: Generación de descripciones de habitaciones y stats de NPCs mediante modelos locales (Ollama/Llama 3).

    Companion App Móvil: Web app para que los jugadores tiren dados desde su celular y vean su ficha, conectándose a la IP local del DM.

    Audio Manager: Reproductor de música y efectos de sonido integrado.
