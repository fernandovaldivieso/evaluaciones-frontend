export const ROLES: Record<number, string> = { 1: "Admin", 2: "Evaluador", 3: "Candidato" };
export const NIVELES: Record<number, string> = { 1: "Junior", 2: "Mid", 3: "Senior", 4: "Lead" };
export const TIPOS_PREGUNTA: Record<number, string> = { 1: "Opción Múltiple", 2: "Abierta", 3: "Código", 4: "Verdadero/Falso" };
export const ESTADOS_SESION: Record<number, string> = { 1: "Pendiente", 2: "En Progreso", 3: "Finalizada", 4: "Expirada", 5: "Cancelada" };
export const ESTADOS_PROCESO: Record<number, string> = { 1: "Abierto", 2: "En Curso", 3: "Cerrado", 4: "Cancelado" };

export const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || "evalsystem_token";
export const REFRESH_TOKEN_KEY = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "evalsystem_refresh_token";
export const USER_KEY = process.env.NEXT_PUBLIC_USER_KEY || "evalsystem_user";
