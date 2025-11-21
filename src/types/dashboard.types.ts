export interface DashboardFilters {
  fechaInicio?: string;
  fechaFin?: string;
  idEstado?: number;
  idUnidad?: number;
  idFiscalia?: number;
  idTecnico?: number;
}

export interface RegistroPorEstado {
  idEstado: number;
  nombreEstado: string;
  cantidad: number;
  porcentaje: number;
}

export interface RegistroPorMes {
  mes: string;
  cantidad: number;
}

export interface RegistroPorUnidad {
  idUnidad: number;
  nombreUnidad: string;
  cantidad: number;
}

export interface EstadisticasRegistros {
  totalRegistros: number;
  registrosPorEstado: RegistroPorEstado[];
  registrosPorMes: RegistroPorMes[];
  registrosPorUnidad: RegistroPorUnidad[];
}

export interface AprobacionPorMes {
  mes: string;
  aprobados: number;
  rechazados: number;
}

export interface EstadisticasAprobaciones {
  totalAprobados: number;
  totalRechazados: number;
  totalPendientes: number;
  tiempoPromedioAprobacion: number;
  aprobacionesPorMes: AprobacionPorMes[];
}

export interface ResumenGeneral {
  totalExpedientes: number;
  totalIndicios: number;
  totalDocumentos: number;
  expedientesActivos: number;
  expedientesFinalizados: number;
}

export interface ReporteGeneral {
  resumen: ResumenGeneral;
  estadisticasRegistros: EstadisticasRegistros;
  estadisticasAprobaciones: EstadisticasAprobaciones;
}

export interface MetricaTecnico {
  idTecnico: number;
  nombreTecnico: string;
  totalExpedientes: number;
  expedientesFinalizados: number;
  expedientesConDictamen: number;
  tiempoPromedioResolucion: number;
}

export interface ExportarReporteParams extends DashboardFilters {
  formato?: 'json' | 'csv';
}
