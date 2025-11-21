import axiosInstance from '../config/axios.config';
import type {
  DashboardFilters,
  EstadisticasRegistros,
  EstadisticasAprobaciones,
  ReporteGeneral,
  MetricaTecnico,
  ExportarReporteParams,
} from '../types/dashboard.types';
import type { ApiResponse } from '../types/api.types';

class DashboardService {
  private readonly BASE_URL = '/dashboard';

  /**
   * Construye los parámetros de query string para los filtros
   */
  private buildQueryParams(filters: DashboardFilters): string {
    const params = new URLSearchParams();

    if (filters.fechaInicio) {
      params.append('fechaInicio', filters.fechaInicio);
    }
    if (filters.fechaFin) {
      params.append('fechaFin', filters.fechaFin);
    }
    if (filters.idEstado) {
      params.append('idEstado', filters.idEstado.toString());
    }
    if (filters.idUnidad) {
      params.append('idUnidad', filters.idUnidad.toString());
    }
    if (filters.idFiscalia) {
      params.append('idFiscalia', filters.idFiscalia.toString());
    }
    if (filters.idTecnico) {
      params.append('idTecnico', filters.idTecnico.toString());
    }

    return params.toString();
  }

  /**
   * Obtiene estadísticas generales de registros
   */
  async obtenerEstadisticasRegistros(
    filters: DashboardFilters = {}
  ): Promise<EstadisticasRegistros> {
    const queryParams = this.buildQueryParams(filters);
    const url = `${this.BASE_URL}/estadisticas-registros${queryParams ? `?${queryParams}` : ''}`;

    const response = await axiosInstance.get<ApiResponse<EstadisticasRegistros>>(url);
    return response.data.data;
  }

  /**
   * Obtiene estadísticas de aprobaciones y rechazos
   */
  async obtenerEstadisticasAprobaciones(
    filters: DashboardFilters = {}
  ): Promise<EstadisticasAprobaciones> {
    const queryParams = this.buildQueryParams(filters);
    const url = `${this.BASE_URL}/estadisticas-aprobaciones${queryParams ? `?${queryParams}` : ''}`;

    const response = await axiosInstance.get<ApiResponse<EstadisticasAprobaciones>>(url);
    return response.data.data;
  }

  /**
   * Obtiene un reporte general con todas las estadísticas
   */
  async obtenerReporteGeneral(
    filters: DashboardFilters = {}
  ): Promise<ReporteGeneral> {
    const queryParams = this.buildQueryParams(filters);
    const url = `${this.BASE_URL}/reporte-general${queryParams ? `?${queryParams}` : ''}`;

    const response = await axiosInstance.get<ApiResponse<ReporteGeneral>>(url);
    return response.data.data;
  }

  /**
   * Obtiene métricas de rendimiento por técnico
   */
  async obtenerMetricasTecnicos(
    filters: Pick<DashboardFilters, 'fechaInicio' | 'fechaFin' | 'idUnidad'> = {}
  ): Promise<MetricaTecnico[]> {
    const queryParams = this.buildQueryParams(filters);
    const url = `${this.BASE_URL}/metricas-tecnicos${queryParams ? `?${queryParams}` : ''}`;

    const response = await axiosInstance.get<ApiResponse<MetricaTecnico[]>>(url);
    return response.data.data;
  }

  /**
   * Exporta un reporte a formato específico (JSON o CSV)
   */
  async exportarReporte(params: ExportarReporteParams = {}): Promise<Blob> {
    const { formato = 'json', ...filters } = params;
    const queryParams = this.buildQueryParams(filters);
    const url = `${this.BASE_URL}/exportar?formato=${formato}${queryParams ? `&${queryParams}` : ''}`;

    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    });

    return response.data;
  }

  /**
   * Descarga un reporte exportado
   */
  async descargarReporte(params: ExportarReporteParams = {}): Promise<void> {
    const { formato = 'json' } = params;
    const blob = await this.exportarReporte(params);

    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Nombre del archivo con fecha
    const fecha = new Date().toISOString().split('T')[0];
    const extension = formato === 'csv' ? 'csv' : 'json';
    link.download = `reporte-dashboard-${fecha}.${extension}`;

    // Descargar
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const dashboardService = new DashboardService();
