import { useState, useMemo } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button, DatePicker, Spin, Empty } from 'antd';
import { cn } from '../../utils/cn';
import { useDashboard } from '../../hooks/useDashboard';
import type { DashboardFilters } from '../../types/dashboard.types';

const { RangePicker } = DatePicker;

// Colores para gráficos
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Hook personalizado para datos del dashboard
  const {
    reporte,
    loading,
    error,
    refrescarDatos,
    descargarReporte,
  } = useDashboard(filters);

  // Obtener el rol del usuario
  const userRole = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombreRol || 'Usuario';

  // Transformar datos para los gráficos
  const monthlyData = useMemo(() => {
    if (!reporte?.estadisticasRegistros.registrosPorMes) return [];

    return reporte.estadisticasRegistros.registrosPorMes
      .slice(0, 6)
      .reverse()
      .map(item => ({
        name: item.mes.substring(5), // Obtener solo el mes (MM)
        casos: item.cantidad,
      }));
  }, [reporte]);

  const estadosPieData = useMemo(() => {
    if (!reporte?.estadisticasRegistros.registrosPorEstado) return [];

    return reporte.estadisticasRegistros.registrosPorEstado.map(estado => ({
      name: estado.nombreEstado,
      value: estado.cantidad,
    }));
  }, [reporte]);

  const aprobacionesData = useMemo(() => {
    if (!reporte?.estadisticasAprobaciones.aprobacionesPorMes) return [];

    return reporte.estadisticasAprobaciones.aprobacionesPorMes
      .slice(0, 6)
      .reverse()
      .map(item => ({
        name: item.mes.substring(5),
        aprobados: item.aprobados,
        rechazados: item.rechazados,
      }));
  }, [reporte]);

  // Stats cards con datos reales
  const stats = useMemo(() => {
    if (!reporte) return [];

    return [
      {
        title: 'Expedientes Activos',
        value: reporte.resumen.expedientesActivos.toLocaleString(),
        change: '',
        isPositive: true,
        icon: FileTextOutlined,
        color: 'text-primary-600',
        bgColor: 'bg-primary-50',
      },
      {
        title: 'Casos Completados',
        value: reporte.resumen.expedientesFinalizados.toLocaleString(),
        change: '',
        isPositive: true,
        icon: CheckCircleOutlined,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: 'Total Indicios',
        value: reporte.resumen.totalIndicios.toLocaleString(),
        change: '',
        isPositive: true,
        icon: ClockCircleOutlined,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      },
      {
        title: 'Total Documentos',
        value: reporte.resumen.totalDocumentos.toLocaleString(),
        change: '',
        isPositive: true,
        icon: TeamOutlined,
        color: 'text-primary-500',
        bgColor: 'bg-primary-50',
      },
    ];
  }, [reporte]);

  // Manejar cambios en filtros de fecha
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        ...filters,
        fechaInicio: dates[0].format('YYYY-MM-DD'),
        fechaFin: dates[1].format('YYYY-MM-DD'),
      });
    } else {
      const { fechaInicio, fechaFin, ...rest } = filters;
      setFilters(rest);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    refrescarDatos(filters);
    setShowFilters(false);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFilters({});
    refrescarDatos({});
  };

  // Mostrar loading o error
  if (loading && !reporte) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar
          userName={`${user?.nombre} ${user?.apellido}`}
          userRole={userRole}
        />
        <main className="flex-1 lg:ml-64 transition-all duration-300">
          <div className="flex items-center justify-center h-screen">
            <Spin size="large" tip="Cargando datos del dashboard..." />
          </div>
        </main>
      </div>
    );
  }

  if (error && !reporte) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar
          userName={`${user?.nombre} ${user?.apellido}`}
          userRole={userRole}
        />
        <main className="flex-1 lg:ml-64 transition-all duration-300">
          <div className="flex items-center justify-center h-screen">
            <Empty
              description={error || 'Error al cargar los datos'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => refrescarDatos()}>
                Reintentar
              </Button>
            </Empty>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        userName={`${user?.nombre} ${user?.apellido}`}
        userRole={userRole}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                  Bienvenido,{' '}
                  <span className="font-semibold text-primary-700">
                    {user?.nombre} {user?.apellido}
                  </span>
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtros
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => refrescarDatos(filters)}
                  loading={loading}
                >
                  Actualizar
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => descargarReporte('csv', filters)}
                  type="primary"
                >
                  Exportar CSV
                </Button>
              </div>
            </div>

            {/* Filtros */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de Fechas
                    </label>
                    <RangePicker
                      onChange={handleDateRangeChange}
                      format="YYYY-MM-DD"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button type="primary" onClick={aplicarFiltros}>
                    Aplicar Filtros
                  </Button>
                  <Button onClick={limpiarFiltros}>
                    Limpiar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    </div>
                    <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                      <Icon className={cn('text-2xl', stat.color)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area Chart - Registros por Mes */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Registros por Mes</h2>
              </div>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorCasos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="casos"
                      stroke="#1890ff"
                      strokeWidth={2}
                      fill="url(#colorCasos)"
                      name="Registros"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No hay datos disponibles" />
              )}
            </div>

            {/* Bar Chart - Aprobaciones y Rechazos */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Aprobaciones y Rechazos</h2>
              </div>
              {aprobacionesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={aprobacionesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="aprobados" fill="#52c41a" radius={[8, 8, 0, 0]} name="Aprobados" />
                    <Bar dataKey="rechazados" fill="#f5222d" radius={[8, 8, 0, 0]} name="Rechazados" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No hay datos disponibles" />
              )}
            </div>
          </div>

          {/* Estadísticas por Estado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Estados */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Distribución por Estado</h2>
              </div>
              {estadosPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={estadosPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {estadosPieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No hay datos disponibles" />
              )}
            </div>

            {/* Resumen de Estadísticas */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Resumen de Estadísticas</h2>
              </div>
              {reporte?.estadisticasAprobaciones && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircleOutlined className="text-2xl text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Total Aprobados</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {reporte.estadisticasAprobaciones.totalAprobados}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ExclamationCircleOutlined className="text-2xl text-red-600" />
                      <span className="text-sm font-medium text-gray-700">Total Rechazados</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">
                      {reporte.estadisticasAprobaciones.totalRechazados}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ClockCircleOutlined className="text-2xl text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">Pendientes</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">
                      {reporte.estadisticasAprobaciones.totalPendientes}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileTextOutlined className="text-2xl text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Tiempo Promedio (días)</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {reporte.estadisticasAprobaciones.tiempoPromedioAprobacion.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
