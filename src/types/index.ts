// --- Genérico ---
export interface ApiResponse<T = null> {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: T | null;
  errors: string[] | null;
}

// --- Auth ---
export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: number;
}
export interface RefreshTokenRequest {
  token: string;
}
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expira: string;
  usuario: UsuarioInfo;
}
export interface UsuarioInfo {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

// --- Usuarios ---
export interface UsuarioDto {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt: string;
}
export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  rol: number;
}
export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  rol?: number;
  activo?: boolean;
}

// --- Tecnologías ---
export interface TecnologiaDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  createdAt: string;
}
export interface CreateTecnologiaDto {
  nombre: string;
  descripcion?: string;
}
export interface UpdateTecnologiaDto {
  nombre?: string;
  descripcion?: string;
  activa?: boolean;
}

// --- Evaluaciones ---
export interface EvaluacionDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  nivel: number;
  nivelNombre: string;
  tiempoLimiteMinutos: number;
  activa: boolean;
  tecnologiaId: string;
  tecnologiaNombre: string;
  createdAt: string;
}
export interface EvaluacionDetalleDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  nivel: number;
  nivelNombre: string;
  tiempoLimiteMinutos: number;
  activa: boolean;
  tecnologiaId: string;
  tecnologiaNombre: string;
  secciones: SeccionDetalleDto[];
  createdAt: string;
}
export interface SeccionDetalleDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  preguntas: PreguntaDetalleDto[];
}
export interface PreguntaDetalleDto {
  id: string;
  texto: string;
  tipo: number;
  tipoNombre: string;
  puntaje: number;
  tiempoSegundos: number;
  orden: number;
  explicacion: string | null;
  opciones: OpcionDto[] | null;
}
export interface OpcionDto {
  id: string;
  texto: string;
  esCorrecta: boolean;
  orden: number;
}
export interface CreateEvaluacionDto {
  nombre: string;
  descripcion?: string;
  nivel: number;
  tiempoLimiteMinutos: number;
  tecnologiaId: string;
}
export interface UpdateEvaluacionDto {
  nombre?: string;
  descripcion?: string;
  nivel?: number;
  tiempoLimiteMinutos?: number;
  tecnologiaId?: string;
  activa?: boolean;
}

// --- Secciones ---
export interface SeccionDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  evaluacionId: string;
  createdAt: string;
}
export interface CreateSeccionDto {
  nombre: string;
  descripcion?: string;
  orden: number;
}
export interface UpdateSeccionDto {
  nombre?: string;
  descripcion?: string;
  orden?: number;
}

// --- Preguntas ---
export interface PreguntaDto {
  id: string;
  texto: string;
  tipo: number;
  tipoNombre: string;
  puntaje: number;
  tiempoSegundos: number;
  orden: number;
  explicacion: string | null;
  seccionId: string;
  opciones: OpcionDto[] | null;
  createdAt: string;
}
export interface CreatePreguntaDto {
  texto: string;
  tipo: number;
  puntaje: number;
  tiempoSegundos: number;
  orden: number;
  explicacion?: string;
  opciones?: CreateOpcionDto[];
}
export interface UpdatePreguntaDto {
  texto?: string;
  tipo?: number;
  puntaje?: number;
  tiempoSegundos?: number;
  orden?: number;
  explicacion?: string;
}
export interface CreateOpcionDto {
  texto: string;
  esCorrecta: boolean;
  orden: number;
}

// --- Procesos ---
export interface ProcesoDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  puesto: string | null;
  estado: number;
  estadoNombre: string;
  fechaLimite: string | null;
  creadorId: string;
  creadorNombre: string;
  totalCandidatos: number;
  totalEvaluaciones: number;
  createdAt: string;
}
export interface ProcesoDetalleDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  puesto: string | null;
  estado: number;
  estadoNombre: string;
  fechaLimite: string | null;
  creadorId: string;
  creadorNombre: string;
  candidatos: CandidatoProcesoDto[];
  evaluaciones: EvaluacionProcesoDto[];
  createdAt: string;
}
export interface CandidatoProcesoDto {
  id: string;
  nombre: string;
  email: string;
}
export interface EvaluacionProcesoDto {
  id: string;
  nombre: string;
  tecnologiaNombre: string;
  nivelNombre: string;
}
export interface CreateProcesoDto {
  nombre: string;
  descripcion?: string;
  puesto?: string;
  fechaLimite?: string;
}
export interface UpdateProcesoDto {
  nombre?: string;
  descripcion?: string;
  puesto?: string;
  estado?: number;
  fechaLimite?: string;
}
export interface AsignarCandidatosDto {
  candidatoIds: string[];
}
export interface AsignarEvaluacionesDto {
  evaluacionIds: string[];
}

// --- Sesiones ---
export interface SesionDto {
  id: string;
  estado: number;
  estadoNombre: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  scoreObtenido: number | null;
  scoreMaximo: number;
  candidatoId: string;
  candidatoNombre: string;
  evaluacionId: string;
  evaluacionNombre: string;
  procesoId: string | null;
  createdAt: string;
}
export interface IniciarSesionDto {
  evaluacionId: string;
  procesoId?: string;
}
export interface ResponderPreguntaDto {
  preguntaId: string;
  respuesta: string;
  opcionSeleccionadaId?: string;
  tiempoRespuestaSegundos: number;
}
export interface ProgresoSesionDto {
  sesionId: string;
  totalPreguntas: number;
  preguntasRespondidas: number;
  porcentajeCompletado: number;
  tiempoRestanteSegundos: number | null;
  estado: string;
}
export interface RespuestaDto {
  id: string;
  preguntaId: string;
  preguntaTexto: string;
  respuesta: string;
  tiempoRespuestaSegundos: number;
  esCorrecta: boolean | null;
  puntajeObtenido: number | null;
  createdAt: string;
}

// --- Resultados ---
export interface ResultadoDto {
  id: string;
  scoreTotal: number;
  scorePorSeccion: string | null;
  brechasIdentificadas: string | null;
  fortalezasIdentificadas: string | null;
  recomendacionIA: string | null;
  fechaAnalisis: string;
  sesionId: string;
  candidatoNombre: string;
  evaluacionNombre: string;
}
export interface ComparacionCandidatoDto {
  candidatoId: string;
  candidatoNombre: string;
  scoreTotal: number;
  fortalezas: string | null;
  brechas: string | null;
  posicion: number;
}
export interface RankingProcesoDto {
  procesoId: string;
  procesoNombre: string;
  ranking: ComparacionCandidatoDto[];
}
