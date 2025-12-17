# 📋 DM Toolbox - Tracking de Tareas

**Última actualización:** 16 de diciembre de 2025
**Versión actual:** 0.3.1 (Beta en preparación)

---

## 📊 Estado General del Proyecto

### Componentes Core
- ✅ **Arquitectura Base** - Electron + Vite + React 18 + TypeScript
- ✅ **Base de Datos** - RxDB + Dexie (IndexedDB) funcionando
- ✅ **Navegación** - React Router con HashRouter
- ✅ **Estilos** - Tailwind CSS v4 configurado
- ✅ **Layout** - MainLayout con Sidebar funcional

### Módulos Implementados
- ✅ **Gestión de Campañas** (CRUD completo)
- ✅ **Vista de Detalle de Campaña** (Dashboard interno)
- 🔄 **Combat Tracker** (pendiente)
- 🔄 **Mapas & VTT** (pendiente)
- 🔄 **NPCs & Notas** (pendiente)

---

## ✅ Tareas Completadas

### Sprint 1: Fundación (Completado)
- [x] Configuración inicial de Electron + Vite
- [x] Setup de TypeScript y ESLint
- [x] Configuración de Tailwind CSS v4
- [x] Instalación y configuración de RxDB
- [x] Resolución de errores DB9 y CSP
- [x] Implementación de patrón Singleton para DB
- [x] Creación de DbContext y DbProvider
- [x] Implementación de MainLayout
- [x] Sidebar con navegación funcional
- [x] Schema de Campaign en RxDB

### Sprint 2: Módulo de Campañas (Completado)
- [x] Vista `/campaigns` - Listado de campañas
- [x] Crear nueva campaña con modal completo
- [x] Sistema de tags de juego con colores (8 colores predefinidos)
- [x] Gestor de tags persistente (gameSystemTags collection)
- [x] Eliminar campaña con confirmación
- [x] Ordenamiento por fecha (más recientes primero)
- [x] Estados vacíos con mensajes informativos
- [x] Vista `/campaign/:id` - Detalle de campaña
- [x] Navegación entre listado y detalle
- [x] Dashboard interno con 3 módulos placeholders
- [x] Validación de ID y redirección si no existe
- [x] Estados de carga en vistas
- [x] Display de tags con colores dinámicos en tarjetas

### Sprint 3: Core Features (Completado)
- [x] Combat Tracker (3.1 - 3.8)
- [x] Gestión de NPCs (3.9)
- [x] Sistema de Sesiones (3.10)
- [x] Sistema de Imágenes (3.11)
- [x] Editor Markdown (3.12)
- [x] Internacionalización (3.13)

### Sprint 6: Dashboard Principal (Completado)
- [x] Vista `/dashboard` funcional
- [x] Resumen de campañas recientes
- [x] Accesos rápidos
- [x] Lista de Próximas Sesiones (reemplaza estadísticas)
- [x] Navegación mejorada (Dashboard -> Sesión, Sesión -> Campaña)

---

## 🎯 Tareas Pendientes - Prioridad Alta

### Sprint 7: Refactorización de UX (Completado)
- [x] Rediseño completo de Sidebar (navegación izquierda)
  - [x] Analizar flujos de navegación actuales
  - [x] Diseñar nueva estructura más útil y eficiente
  - [x] Mejorar accesibilidad y UX de navegación (Tooltips, estados activos)
  - [x] Implementar navegación contextual por campaña
- [x] Rediseño de Landing/Dashboard principal
  - [x] Vista inicial más atractiva e informativa
  - [x] Mostrar resumen de actividad reciente
  - [x] Accesos rápidos a funciones principales
  - [x] Mejorar onboarding para nuevos usuarios
- [x] Personalización de Campañas
  - [x] Soporte para imágenes de fondo (banners)
  - [x] Visualización de banners en Dashboard y Detalle

---

## 🎯 Tareas Pendientes - Prioridad Media

### Sprint 8: Mejoras de UX General
- [x] Edición de campañas (Modal de edición)
- [x] Confirmaciones con modales elegantes (reemplazar `confirm()`)
- [x] Toasts/notificaciones de éxito/error
- [x] Atajos de teclado
- [x] Tooltips informativos

### Sprint 5: Integraciones y Mejoras
- [x] Búsqueda y filtros avanzados de NPCs
- [x] Búsqueda en Monstruos y Personajes
- [x] Integración con Combat Tracker (añadir NPC desde lista)
- [x] Mejorar visualización de notas

### Sprint 9: Vista de Jugador y Estabilidad (Beta)
- [ ] **Vista de Jugador** (Ventana independiente/secundaria)
- [ ] Sincronización de estado de combate a vista de jugador
- [ ] **Estrategia de Migración de Datos** (Verificación de Schema Versioning)
- [ ] Sistema de Backup/Restauración (Exportar/Importar JSON)

---

## 🎯 Tareas Pendientes - Prioridad Baja

### Sprint 4: Sistema de Mapas y VTT
**Nota:** Pospuesto para fase posterior.
- [ ] Base de datos (Scenes, Tokens, Fog)
- [ ] Carga y display de mapas (Konva.js)
- [ ] Gestión de Tokens
- [ ] Fog of War
- [ ] Ventana de Jugador

---

## 🚀 Roadmap Futuro (Post-MVP)

### Fase 2: Features Avanzadas
- [ ] Audio Manager (música de fondo y efectos)
- [ ] Integración con IA (generación de descripciones)
- [ ] Sistema de dados integrado
- [ ] Importar/Exportar campañas (JSON)
- [ ] Backup automático en carpeta local
- [ ] Temas de color personalizables

### Fase 3: Multiplataforma
- [ ] Build para Linux
- [ ] Build para macOS
- [ ] Progressive Web App (opcional)

### Fase 4: Colaboración (Opcional)
- [ ] Sincronización con servidor propio
- [ ] Companion App móvil
- [ ] Compartir mapas entre DMs

---

## 📈 Métricas de Progreso

### Por Módulo
```
✅ Fundación:        100% (9/9)
✅ Campañas:         100% (13/13)
✅ Combat Tracker:   100% (41/41)
✅ NPCs:             100% (7/7)
✅ Imágenes:         100% (11/11)
✅ Sesiones:         100% (15/15)
✅ Markdown:         100% (5/5)
✅ i18n:             100% (12/12)
✅ Dashboard:        100% (4/4)
⬜ Mapas:              0% (0/17)
⬜ UX Refactor:        100% (7/7)
```

### General
**Completado:** 119 tareas
**Pendientes:** 22 tareas
**Progreso Total:** ~84%

---

## 🏷️ Leyenda

- ✅ Completado
- 🔄 En progreso
- ⬜ Pendiente
- 🔴 Bloqueado
- 🔵 Prioridad Alta
- 🟡 Prioridad Media
- ⚪ Prioridad Baja

---

## 📝 Notas Técnicas

### Decisiones de Arquitectura
1. **Local-First:** Todos los datos en IndexedDB, sin backend requerido
2. **Singleton Pattern:** Una sola instancia de DB en toda la app
3. **HashRouter:** Mejor compatibilidad con Electron que BrowserRouter
4. **Tailwind v4:** Configuración via CSS, sin archivo JS
5. **TypeScript Strict:** Tipado fuerte en todos los componentes
6. **RxDBUpdatePlugin:** Habilitado para permitir document.update() en documentos
7. **Tag System:** Sistema de tags reutilizables con colores para mejor organización

### Dependencias Críticas
- `rxdb@16.21.1` - Base de datos reactiva
- `dexie@4.2.1` - Storage adapter para RxDB
- `react-router-dom@7.10.1` - Navegación
- `konva@10.0.12` - Canvas para mapas (pendiente usar)
- `react-konva@19.2.1` - Wrapper React de Konva
- `lucide-react@0.556.0` - Librería de iconos

### Schemas Actuales en RxDB
1. **campaigns** - Campañas con sistema de tags coloreados
2. **combatEncounters** - Encuentros de combate
3. **combatants** - Participantes en combate
4. **characters** - Personajes de campaña (para auto-agregar a combates)
5. **gameSystemTags** - Tags de sistemas de juego reutilizables

### Próximos Pasos Inmediatos
1. � Mejoras de UX General (Sprint 8)
2. ⚪ Sistema de Mapas y VTT (Sprint 4)

---

**¿Listo para continuar?** El siguiente paso lógico es comenzar con las **Mejoras de UX General** (Sprint 8).

### 🎉 Hitos Recientes
- ✅ **Dashboard Rediseñado** - Nueva vista principal con estadísticas y onboarding
- ✅ **Visualización de Notas** - Notas expandibles en NPCs, Monstruos y Personajes
- ✅ **Búsqueda y Filtros** - Implementado en NPCs, Monstruos y Personajes
- ✅ **Combat Tracker completo** - Sistema de combate funcional con edición avanzada
- ✅ **Sistema de Condiciones** - Gestión de estados con 9 condiciones predefinidas + personalizadas
- ✅ **Gestión de Personajes** - CRUD completo con integración a combates
- ✅ **Sistema de NPCs** - CRUD completo con toggle hostil/neutral
- ✅ **Sistema de Imágenes** - Soporte completo de avatares en Characters, NPCs y Combat
- ✅ **Sistema de Sesiones** - Planificación completa con vinculación de combates/NPCs
- ✅ **Editor Markdown** - Editor WYSIWYG con preview en tiempo real
- ✅ **Internacionalización (i18n)** - Soporte completo Español/Inglés con selector de idioma
- ✅ **Vista de Configuración** - Sección completa con gestión de idioma y about
- ✅ **Visualización de Detalles** - Ataques y notas expandibles en combatientes
- ✅ **Sistema de Tags** - Gestión de etiquetas con colores para mejor organización
- ✅ **Mejoras de UX** - Auto-select, formateo automático, controles variables de HP
- ✅ **7 Collections** - Base de datos completa: campaigns, combatEncounters, combatants, characters, gameSystemTags, npcs, sessions
