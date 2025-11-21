import { useAuthStore } from '../../store/auth.store';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../utils/cn';

// Datos de ejemplo para los gráficos
const monthlyData = [
  { name: 'Ene', casos: 65, completados: 45 },
  { name: 'Feb', casos: 78, completados: 52 },
  { name: 'Mar', casos: 90, completados: 68 },
  { name: 'Abr', casos: 81, completados: 71 },
  { name: 'May', casos: 95, completados: 78 },
  { name: 'Jun', casos: 110, completados: 89 },
];

const activityData = [
  { name: 'Lun', actividad: 45 },
  { name: 'Mar', actividad: 62 },
  { name: 'Mié', actividad: 58 },
  { name: 'Jue', actividad: 71 },
  { name: 'Vie', actividad: 85 },
  { name: 'Sáb', actividad: 32 },
  { name: 'Dom', actividad: 28 },
];

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  // Obtener el rol del usuario (puede ser string directo o objeto)
  const userRole = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombreRol || 'Usuario';

  const stats = [
    {
      title: 'Expedientes Activos',
      value: '248',
      change: '+12%',
      isPositive: true,
      icon: FileTextOutlined,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Casos Completados',
      value: '1,429',
      change: '+8%',
      isPositive: true,
      icon: CheckCircleOutlined,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'En Proceso',
      value: '86',
      change: '-3%',
      isPositive: false,
      icon: ClockCircleOutlined,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Usuarios Activos',
      value: '64',
      change: '+5%',
      isPositive: true,
      icon: TeamOutlined,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
  ];

  const recentActivity = [
    { id: 1, title: 'Expediente #2024-1547 asignado', time: 'Hace 5 minutos', type: 'new' },
    { id: 2, title: 'Análisis forense completado #2024-1523', time: 'Hace 1 hora', type: 'completed' },
    { id: 3, title: 'Revisión pendiente #2024-1502', time: 'Hace 2 horas', type: 'pending' },
    { id: 4, title: 'Nuevo usuario registrado', time: 'Hace 3 horas', type: 'info' },
    { id: 5, title: 'Reporte mensual generado', time: 'Hace 5 horas', type: 'info' },
  ];

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
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Bienvenido,{' '}
                <span className="font-semibold text-primary-700">
                  {user?.nombre} {user?.apellido}
                </span>
              </p>
            </div>
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
                      <div className="flex items-center gap-1">
                        {stat.isPositive ? (
                          <RiseOutlined className="text-green-500" />
                        ) : (
                          <FallOutlined className="text-red-500" />
                        )}
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            stat.isPositive ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500">vs mes anterior</span>
                      </div>
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
            {/* Area Chart - Monthly Cases */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Casos Mensuales</h2>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Ver detalles
                </button>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorCasos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompletados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
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
                    name="Casos"
                  />
                  <Area
                    type="monotone"
                    dataKey="completados"
                    stroke="#52c41a"
                    strokeWidth={2}
                    fill="url(#colorCompletados)"
                    name="Completados"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Weekly Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Actividad Semanal</h2>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Ver detalles
                </button>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={activityData}>
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
                  <Bar dataKey="actividad" fill="#1890ff" radius={[8, 8, 0, 0]} name="Actividad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Ver todo
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      activity.type === 'new' && 'bg-primary-50',
                      activity.type === 'completed' && 'bg-green-50',
                      activity.type === 'pending' && 'bg-yellow-50',
                      activity.type === 'info' && 'bg-blue-50'
                    )}
                  >
                    {activity.type === 'new' && <FileTextOutlined className="text-primary-600" />}
                    {activity.type === 'completed' && <CheckCircleOutlined className="text-green-600" />}
                    {activity.type === 'pending' && <ClockCircleOutlined className="text-yellow-600" />}
                    {activity.type === 'info' && <ExclamationCircleOutlined className="text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
