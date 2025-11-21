import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type {
  DashboardFilters,
  EstadisticasRegistros,
  EstadisticasAprobaciones,
  ReporteGeneral,
  MetricaTecnico,
} from '../types/dashboard.types';
import { message } from 'antd';

interface UseDashboardState {
  reporte: ReporteGeneral | null;
  estadisticasRegistros: EstadisticasRegistros | null;
  estadisticasAprobaciones: EstadisticasAprobaciones | null;
  metricasTecnicos: MetricaTecnico[];
  loading: boolean;
  error: string | null;
}

interface UseDashboardReturn extends UseDashboardState {
  cargarReporteGeneral: (filters?: DashboardFilters) => Promise<void>;
  cargarEstadisticasRegistros: (filters?: DashboardFilters) => Promise<void>;
  cargarEstadisticasAprobaciones: (filters?: DashboardFilters) => Promise<void>;
  cargarMetricasTecnicos: (filters?: Pick<DashboardFilters, 'fechaInicio' | 'fechaFin' | 'idUnidad'>) => Promise<void>;
  descargarReporte: (formato: 'json' | 'csv', filters?: DashboardFilters) => Promise<void>;
  refrescarDatos: (filters?: DashboardFilters) => Promise<void>;
}

/**
 * Hook personalizado para manejar datos del dashboard
 */
export const useDashboard = (initialFilters?: DashboardFilters): UseDashboardReturn => {
  const [state, setState] = useState<UseDashboardState>({
    reporte: null,
    estadisticasRegistros: null,
    estadisticasAprobaciones: null,
    metricasTecnicos: [],
    loading: false,
    error: null,
  });

  /**
   * Carga el reporte general completo
   */
  const cargarReporteGeneral = useCallback(async (filters?: DashboardFilters) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const reporte = await dashboardService.obtenerReporteGeneral(filters || initialFilters || {});
      setState((prev) => ({
        ...prev,
        reporte,
        estadisticasRegistros: reporte.estadisticasRegistros,
        estadisticasAprobaciones: reporte.estadisticasAprobaciones,
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar el reporte general';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      message.error(errorMessage);
    }
  }, [initialFilters]);

  /**
   * Carga solo las estadísticas de registros
   */
  const cargarEstadisticasRegistros = useCallback(async (filters?: DashboardFilters) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const estadisticasRegistros = await dashboardService.obtenerEstadisticasRegistros(
        filters || initialFilters || {}
      );
      setState((prev) => ({
        ...prev,
        estadisticasRegistros,
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar estadísticas de registros';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      message.error(errorMessage);
    }
  }, [initialFilters]);

  /**
   * Carga solo las estadísticas de aprobaciones
   */
  const cargarEstadisticasAprobaciones = useCallback(async (filters?: DashboardFilters) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const estadisticasAprobaciones = await dashboardService.obtenerEstadisticasAprobaciones(
        filters || initialFilters || {}
      );
      setState((prev) => ({
        ...prev,
        estadisticasAprobaciones,
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar estadísticas de aprobaciones';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      message.error(errorMessage);
    }
  }, [initialFilters]);

  /**
   * Carga las métricas de técnicos
   */
  const cargarMetricasTecnicos = useCallback(
    async (filters?: Pick<DashboardFilters, 'fechaInicio' | 'fechaFin' | 'idUnidad'>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const metricasTecnicos = await dashboardService.obtenerMetricasTecnicos(filters || {});
        setState((prev) => ({
          ...prev,
          metricasTecnicos,
          loading: false,
        }));
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Error al cargar métricas de técnicos';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        message.error(errorMessage);
      }
    },
    []
  );

  /**
   * Descarga el reporte en formato JSON o CSV
   */
  const descargarReporte = useCallback(
    async (formato: 'json' | 'csv', filters?: DashboardFilters) => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        await dashboardService.descargarReporte({
          formato,
          ...(filters || initialFilters || {}),
        });
        message.success(`Reporte descargado exitosamente en formato ${formato.toUpperCase()}`);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Error al descargar el reporte';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        message.error(errorMessage);
      }
    },
    [initialFilters]
  );

  /**
   * Refresca todos los datos del dashboard
   */
  const refrescarDatos = useCallback(
    async (filters?: DashboardFilters) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [reporte, metricasTecnicos] = await Promise.all([
          dashboardService.obtenerReporteGeneral(filters || initialFilters || {}),
          dashboardService.obtenerMetricasTecnicos(filters || {}),
        ]);

        setState({
          reporte,
          estadisticasRegistros: reporte.estadisticasRegistros,
          estadisticasAprobaciones: reporte.estadisticasAprobaciones,
          metricasTecnicos,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Error al refrescar los datos';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        message.error(errorMessage);
      }
    },
    [initialFilters]
  );

  // Cargar datos iniciales
  useEffect(() => {
    cargarReporteGeneral();
  }, [cargarReporteGeneral]);

  return {
    ...state,
    cargarReporteGeneral,
    cargarEstadisticasRegistros,
    cargarEstadisticasAprobaciones,
    cargarMetricasTecnicos,
    descargarReporte,
    refrescarDatos,
  };
};
