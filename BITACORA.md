# Bitácora — EvalSystem Frontend

**Fecha:** 19 de marzo de 2026  
**Autor:** Equipo Frontend  
**Versión:** 1.0.0 — Integración completa con Backend .NET 8

---

## Resumen Ejecutivo

Se implementó la identidad visual corporativa (Azul/Rojo) siguiendo la regla 60-30-10, se configuró un sistema de animaciones profesional con GSAP y se pulió la experiencia responsive mobile-first. Se añadió infraestructura de testing con Vitest.

---

## Tarea 1: Configuración de Design System

### Archivos modificados
- `src/app/globals.css`
- `src/app/layout.tsx`

### Cambios realizados

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#1b4965` | Navegación, CTAs, estados de confianza |
| `--color-primary-dark` | `#153e56` | Hover sobre botones primarios |
| `--color-primary-light` | `#e8f0f5` | Backgrounds de items activos |
| `--color-primary-50` | `#f0f6fa` | Tinte sutil para hover |
| `--color-accent` | `#c0392b` | Botón "Finalizar", timer bajo, alertas |
| `--color-accent-dark` | `#a93226` | Hover sobre botones críticos |
| `--color-accent-light` | `#fdecea` | Background del timer en estado low |
| `--color-surface` | `#ffffff` | Cards, modales |
| `--color-surface-alt` | `#f8fafc` | Fondo de página (slate-50) |
| `--color-border` | `#e2e8f0` | Bordes sutiles (slate-200) |
| `--color-success` | `#16a34a` | Estados exitosos |
| `--color-warning` | `#d97706` | Advertencias |

**Tipografía:** Se migró de `@import url(...)` a `next/font/google` (Outfit) para:
- Self-hosting automático (sin requests externos a Google Fonts en producción)
- Eliminación de layout shift (CLS = 0)
- Variable CSS `--font-family-outfit` inyectada por Next.js

**Extras CSS añadidos:**
- `scroll-behavior: smooth` en `html`
- `::selection` con colores primarios
- `:focus-visible` ring consistente (`outline: 2px solid primary`)
- Scrollbar personalizado (Webkit) — 6px, gris sutil

---

## Tarea 2: Implementación de GSAP (Capa de Animación)

### Archivos modificados
- `src/app/(auth)/layout.tsx` — revealContent al card de auth
- `src/app/(auth)/login/page.tsx` — staggerList a campos del formulario
- `src/app/(auth)/register/page.tsx` — staggerList a campos del formulario
- `src/app/(assessment)/layout.tsx` — revealContent al header y main
- `src/components/question-card.tsx` — Animación de entrada + transición entre preguntas
- `src/components/navbar.tsx` — revealContent slide-down

### Presets de animación (`src/lib/animations.ts`)

| Función | Descripción | Uso |
|---|---|---|
| `revealContent` | FadeIn + SlideUp (opacity 0→1, y offset→0) | Carga de vistas, dashboards, tablas |
| `staggerList` | Stagger secuencial de elementos hijos | Listas de evaluaciones, nav items, campos de form |
| `pulseTimer` | Scale 1↔1.05 en loop con yoyo | Timer cuando timeRemaining ≤ 60s |
| `hoverScale` | Scale-up suave (1→1.02) | Micro-interacción de hover |
| `hoverScaleReset` | Retorno a scale 1 | Salida de hover |

### Componentes que usan GSAP

| Componente | Hook | Animación |
|---|---|---|
| `Sidebar` | `useGSAP` | `staggerList` en nav items al montar |
| `Timer` | `useGSAP` | `pulseTimer` cuando `isLowTime` es true |
| `EvaluationsPage` | `useGSAP` | `revealContent` + `staggerList` en header, stats, tabla, filas |
| `RankingPage` | `useGSAP` | `revealContent` + `staggerList` en header, stats, tabla, filas |
| `AuthLayout` | `useGSAP` | `revealContent` para el card contenedor |
| `LoginPage` | `useGSAP` | `staggerList` en campos del formulario |
| `RegisterPage` | `useGSAP` | `staggerList` en campos del formulario |
| `AssessmentLayout` | `useGSAP` | `revealContent` en header y contenido principal |
| `Navbar` | `useGSAP` | `revealContent` slide-down |
| `QuestionCard` | `useGSAP` + `useEffect` | Entrada al montar + transición al cambiar de pregunta |

---

## Tarea 3: Pulido de Responsiveness y UX

### Sidebar (ya existente, validado)
- **Desktop:** Sidebar colapsable (w-64 ↔ w-16) con toggle ChevronLeft/Right
- **Mobile:** Drawer deslizable desde la izquierda con overlay backdrop-blur
- **Hamburger trigger:** Fijo en `left-4 top-4 z-40` visible solo en `md:hidden`

### Navbar
- **Desktop:** Visible como barra completa con búsqueda y acciones
- **Mobile:** Oculto (`hidden md:flex`) — la navegación se hace vía Sidebar drawer
- **Active states:** `active:scale-100` y `active:scale-[0.98]` añadidos

### Assessment Layout
- Padding responsive: `p-4 sm:p-6`
- Counter de pregunta oculto en mobile (`hidden sm:inline`)
- Gaps reducidos en mobile: `gap-3 sm:gap-4`

### Dashboard Layout
- `pt-16 md:pt-6` para compensar el hamburger fijo en mobile

### Auth Layout
- Padding horizontal `px-4` añadido para evitar overflow en pantallas estrechas

### Question Card
- Padding responsive: `p-6 sm:p-8`

### Micro-interacciones (Tailwind)
Todos los botones ya cuentan con:
- `transition-all duration-200`
- `hover:scale-[1.01]` o `hover:scale-[1.02]` según el contexto
- `active:scale-100` para feedback táctil
- Filas de tabla: `hover:bg-slate-50` con `transition-colors duration-200`

---

## Infraestructura de Testing

### Setup
- **Framework:** Vitest 4.x + jsdom
- **Testing Library:** @testing-library/react + jest-dom
- **Config:** `vitest.config.ts` con path alias y mocks globales

### Test Suites

| Suite | Archivo | Tests | Foco |
|---|---|---|---|
| Navbar | `navbar.test.tsx` | 3 | Render, responsive visibility |
| Sidebar | `sidebar.test.tsx` | 5 | Nav items, collapse, mobile trigger |
| QuestionCard | `question-card.test.tsx` | 5 | MC/text render, selección, submit |
| Animations | `animations.test.ts` | 6 | Todos los presets GSAP |
| Exam Store | `exam-store.test.ts` | 8 | State, navigation, timer, answers |
| Design System | `design-system.test.ts` | 4 | Mock data integrity |

**Total: 31 tests — 31 passing ✅**

### Comandos
```bash
npm test          # Ejecución única
npm run test:watch  # Modo watch para desarrollo
```

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2.0 | Framework (Turbopack) |
| React | 19.2.4 | UI Library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first CSS |
| GSAP | 3.14.2 | Animaciones profesionales |
| @gsap/react | 2.1.2 | Hook `useGSAP` con cleanup automático |
| Zustand | 5.x | State management (exam store) |
| Lucide React | 0.577.x | Iconografía |
| Vitest | 4.x | Testing framework |
| Testing Library | Latest | Component testing |

---

## Verificación Final (Fase Identidad Visual)

- ✅ `npm run build` — Compilación exitosa (Turbopack, 14.1s)
- ✅ `npm test` — 31/31 tests passing
- ✅ 7 rutas generadas estáticamente: `/`, `/evaluations`, `/ranking`, `/exam`, `/login`, `/register`, `/_not-found`
- ✅ TypeScript strict mode — 0 errores
- ✅ Fuente Outfit cargando via `next/font/google` (self-hosted)
- ✅ Design tokens aplicados correctamente

---
---

# Fase 2: Integración Completa con Backend .NET 8

**Fecha:** Sesión actual  
**Objetivo:** Reemplazar todos los mock data con llamadas reales al API, implementar autenticación JWT, control de acceso por roles, y completar todas las pantallas CRUD.

---

## 1. Infraestructura Base

### Dependencias instaladas
- `axios` — Cliente HTTP con interceptores
- `jwt-decode` — Decodificación de JWT para extracción de claims
- `sonner` — Sistema de toast notifications

### Archivos de configuración
| Archivo | Descripción |
|---|---|
| `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:5099/api` |
| `.env.production` | Template para producción |

### Cliente API (`src/lib/api-client.ts`)
- Instancia Axios con baseURL desde variable de entorno
- **Request interceptor:** Inyecta `Authorization: Bearer <token>` automáticamente
- **Response interceptor:** Manejo de 401 con refresh token + cola de requests fallidos
- Patrón de cola concurrente: `isRefreshing` flag + `failedQueue` para evitar múltiples refresh simultáneos

---

## 2. Sistema de Autenticación

### Archivos creados
| Archivo | Descripción |
|---|---|
| `src/services/auth.service.ts` | Login, register, logout, getStoredUser, isAuthenticated |
| `src/contexts/auth-context.tsx` | AuthProvider con estado de usuario, login/register/logout |
| `src/hooks/use-auth.ts` | Hook wrapper para AuthContext |
| `src/components/protected-route.tsx` | Guard con roles opcionales, loader, pantalla "Sin permisos" |
| `src/app/providers.tsx` | Wrapper que envuelve la app con AuthProvider |

### Flujo de autenticación
1. Login/Register → POST a `/auth/login` o `/auth/register`
2. Backend retorna `AuthResponse` con `token`, `refreshToken`, `usuario`
3. Se almacena en `localStorage` (`evalSystem_token`, `evalSystem_refreshToken`, `evalSystem_user`)
4. Al recargar, `AuthProvider` lee de localStorage y restaura sesión
5. En 401, se intenta refresh automático; si falla, se hace logout

### Redirección por rol
- **Candidato** → `/mis-sesiones`
- **Admin/Evaluador** → `/dashboard`
- **No autenticado** → `/login`

---

## 3. Capa de Servicios API

Se crearon 7 servicios siguiendo el patrón `ApiResponse<T>`:

| Servicio | Archivo | Endpoints |
|---|---|---|
| Auth | `auth.service.ts` | login, register, logout, refresh |
| Usuarios | `usuarios.service.ts` | getAll, getById, create, update, delete |
| Tecnologías | `tecnologias.service.ts` | getAll, getById, create, update |
| Evaluaciones | `evaluaciones.service.ts` | CRUD + secciones + preguntas + opciones + duplicar |
| Procesos | `procesos.service.ts` | CRUD + asignarCandidatos + asignarEvaluaciones |
| Sesiones | `sesiones.service.ts` | iniciar, progreso, responder, finalizar, misSesiones |
| Resultados | `resultados.service.ts` | analizar, getBySesion, getRanking |

---

## 4. Tipos TypeScript (`src/types/index.ts`)

Se reemplazó completamente el archivo de tipos para coincidir con los DTOs del backend:

### Tipos eliminados (mock)
- `Question`, `Evaluation`, `Candidate`, `Result`, `ExamAnswer`

### Tipos nuevos (~50 interfaces)
- **Auth:** `LoginRequest`, `RegisterRequest`, `AuthResponse`, `UsuarioInfo`
- **Usuarios:** `UsuarioDto`, `CrearUsuarioDto`, `ActualizarUsuarioDto`
- **Tecnologías:** `TecnologiaDto`, `CrearTecnologiaDto`
- **Evaluaciones:** `EvaluacionDto`, `EvaluacionDetalleDto`, `SeccionDetalleDto`, `PreguntaDetalleDto`, `OpcionDto`, `CrearEvaluacionDto`, `CrearSeccionDto`, `CrearPreguntaDto`, `CrearOpcionDto`
- **Procesos:** `ProcesoDto`, `ProcesoDetalleDto`, `CrearProcesoDto`
- **Sesiones:** `SesionDto`, `ProgresoSesionDto`, `ResponderPreguntaDto`
- **Resultados:** `ResultadoDto`, `RankingProcesoDto`, `ComparacionCandidatoDto`

### Enums (`src/utils/constants.ts`)
- `ROLES`, `NIVELES`, `TIPOS_PREGUNTA`, `ESTADOS_SESION`, `ESTADOS_PROCESO`
- Keys de localStorage: `TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `USER_KEY`

---

## 5. Pantallas Implementadas

### Auth (modificadas)
| Página | Ruta | Cambios |
|---|---|---|
| Login | `/login` | Conectado a `useAuth().login()`, manejo de errores con toast |
| Register | `/register` | Conectado a `useAuth().register()`, selector de rol |

### Dashboard (nuevo)
| Página | Ruta | Descripción |
|---|---|---|
| Dashboard | `/dashboard` | Cards de estadísticas adaptadas al rol del usuario |

### CRUD Admin
| Página | Ruta | Roles | Funcionalidad |
|---|---|---|---|
| Usuarios | `/usuarios` | Admin | Tabla CRUD completa con modal crear/editar, eliminar |
| Tecnologías | `/tecnologias` | Admin, Evaluador | Tabla CRUD con modal crear/editar |

### Evaluaciones
| Página | Ruta | Descripción |
|---|---|---|
| Lista | `/evaluations` | Tabla con stats, crear evaluación, duplicar |
| Detalle | `/evaluations/[id]` | Accordion de secciones, CRUD de preguntas con opciones inline |

### Procesos de Selección
| Página | Ruta | Descripción |
|---|---|---|
| Lista | `/procesos` | Tabla con badges de estado, crear proceso |
| Detalle | `/procesos/[id]` | Tabs (candidatos/evaluaciones), asignar con multi-select |

### Sesiones de Candidato
| Página | Ruta | Descripción |
|---|---|---|
| Mis Sesiones | `/mis-sesiones` | Lista de sesiones, iniciar evaluación |

### Examen
| Página | Ruta | Descripción |
|---|---|---|
| Exam | `/exam?sesionId=xxx` | Carga sesión+evaluación del backend, 4 tipos de pregunta, auto-finalización en timeout |

### Resultados
| Página | Ruta | Descripción |
|---|---|---|
| Detalle resultado | `/resultados/[sesionId]` | Score circular, barras por sección, fortalezas/brechas, recomendación IA |
| Ranking | `/ranking` | Selector de proceso, tabla rankeada con medallas, barras de puntuación |

---

## 6. Componentes Modificados

| Componente | Cambios |
|---|---|
| `navbar.tsx` | Muestra `user.nombre` + `user.rol`, botón logout con `useAuth()` |
| `sidebar.tsx` | Navegación filtrada por rol, items dinámicos desde `allNavItems` |
| `question-card.tsx` | Soporta 4 tipos de pregunta (Opción Múltiple, Abierta, Código, V/F), recibe `currentOpcionId` |
| `timer.tsx` | Compatible con nuevo store (misma funcionalidad) |
| `layout.tsx` (root) | Envuelto con `Providers` (AuthProvider), `Toaster` de sonner |
| `layout.tsx` (dashboard) | Envuelto con `ProtectedRoute` |
| `layout.tsx` (assessment) | `ProtectedRoute`, usa `preguntas`/`answers` del nuevo store |
| `page.tsx` (root) | Smart redirect: auth → rol → ruta apropiada |

---

## 7. Store Zustand (Refactorizado)

### `src/store/exam-store.ts`
| Campo anterior | Campo nuevo | Tipo |
|---|---|---|
| `questions: Question[]` | `preguntas: PreguntaDetalleDto[]` | Tipos del backend |
| `answers: { questionId, answer }[]` | `answers: { preguntaId, respuesta, opcionSeleccionadaId? }[]` | Soporte opción seleccionada |
| `setQuestions()` | `setPreguntas()` | Renombrado |
| — | `sesionId: string \| null` | Nuevo: ID de sesión activa |
| — | `secciones: SeccionDetalleDto[]` | Nuevo: secciones de la evaluación |
| — | `setSesionId()`, `setSecciones()`, `getAnswer()` | Nuevos métodos |

---

## 8. Layout del Candidato

Se creó un nuevo route group `(candidate)` con:
- `src/app/(candidate)/layout.tsx` — Layout con sidebar/navbar protegido para rol "Candidato"
- `src/app/(candidate)/mis-sesiones/page.tsx` — Lista de sesiones del candidato

---

## 9. Archivos Eliminados

| Archivo | Razón |
|---|---|
| `src/data/mock-data.ts` | Reemplazado por servicios API reales |

---

## 10. Tests Actualizados

Se actualizaron 4 de 6 test suites para reflejar la nueva API:

| Suite | Tests | Cambios |
|---|---|---|
| `exam-store.test.ts` | 8 | Usa `PreguntaDetalleDto`, `setPreguntas`, `submitAnswer` con `opcionSeleccionadaId` |
| `question-card.test.tsx` | 5 | Usa `PreguntaDetalleDto` con opciones, `currentOpcionId`, `vi.fn()` |
| `navbar.test.tsx` | 6 | Mock de `useAuth` para inyectar usuario, verifica nombre y rol |
| `sidebar.test.tsx` | 6 | Mock de `useAuth` + `usePathname`, verifica items de navegación |
| `design-system.test.ts` | 8 | Eliminado bloque "Mock Data Integrity" (mock data ya no existe) |
| `animations.test.ts` | 6 | Sin cambios |

**Total: 39 tests — 39 passing ✅**

---

## 11. Rutas Generadas

```
Route (app)
├ ○ /                    (smart redirect)
├ ○ /_not-found
├ ○ /dashboard           (role-based stats)
├ ○ /evaluations         (CRUD list)
├ λ /evaluations/[id]    (detail + preguntas)
├ ○ /exam                (assessment engine)
├ ○ /login
├ ○ /mis-sesiones        (candidate sessions)
├ ○ /procesos            (CRUD list)
├ λ /procesos/[id]       (detail + tabs)
├ ○ /ranking             (process ranking)
├ ○ /register
├ λ /resultados/[sesionId] (score report)
├ ○ /tecnologias         (CRUD)
└ ○ /usuarios            (Admin CRUD)

○ Static   λ Dynamic
```

---

## Verificación Final (Fase Integración)

- ✅ `npm run build` — Compilación exitosa (Turbopack, 12.5s, 0 errores TypeScript)
- ✅ `npx vitest run` — 39/39 tests passing (6 suites)
- ✅ 15 rutas generadas (12 estáticas + 3 dinámicas)
- ✅ Autenticación JWT con refresh token automático
- ✅ Control de acceso por roles (Admin, Evaluador, Candidato)
- ✅ 7 servicios API conectados al backend .NET 8
- ✅ Mock data eliminado completamente
- ✅ 4 tipos de pregunta soportados en el examen
- ✅ Análisis IA con recomendación en resultados
- ✅ Animaciones GSAP con cleanup vía `useGSAP`
- ✅ Layout responsive mobile-first
