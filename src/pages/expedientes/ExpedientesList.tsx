import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { axiosInstance } from '../../config/axios.config';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

interface Expediente {
  id_expediente: number;
  numero_expediente: string;
  numero_caso_mp: string | null;
  fecha_registro: string;
  id_usuario_registro: number;
  tecnico_nombre: string;
  tecnico_apellido: string;
  fiscalia_nombre: string;
  nombre_unidad: string;
  nombre_estado: string;
  estado_color: string;
  urgencia: string | null;
  tipo_delito: string | null;
  total_indicios: number;
}

const urgenciaColors: Record<string, string> = {
  ordinario: 'bg-gray-100 text-gray-800',
  urgente: 'bg-yellow-100 text-yellow-800',
  muy_urgente: 'bg-red-100 text-red-800',
};

const urgenciaLabels: Record<string, string> = {
  ordinario: 'Ordinario',
  urgente: 'Urgente',
  muy_urgente: 'Muy Urgente',
};

export const ExpedientesList = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { hasPermissionById } = usePermissions();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pendientes' | 'todos'>('pendientes');
  const [idEstadoPendiente, setIdEstadoPendiente] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const userName = user ? `${user.nombre} ${user.apellido}` : '';
  const userRole = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombreRol || '';
  const isSupervisor = userRole === 'SUPERVISOR' || userRole === 'ADMIN';

  // Permisos: 1=crear, 2=ver, 3=editar, 4=eliminar expedientes
  const canCreate = hasPermissionById(1);
  const canView = hasPermissionById(2);
  const canEdit = hasPermissionById(3);

  // Obtener ID del estado "Pendiente de Revisión"
  useEffect(() => {
    const fetchEstadoPendiente = async () => {
      try {
        const response = await axiosInstance.get('/catalogos/estados-expediente');
        if (response.data.success) {
          const estadoPendiente = response.data.data.find(
            (e: { id: number; nombre: string }) => e.nombre === 'Pendiente de Revisión'
          );
          if (estadoPendiente) {
            setIdEstadoPendiente(estadoPendiente.id);
          }
        }
      } catch (error) {
        console.error('Error fetching estados:', error);
      }
    };
    if (isSupervisor) {
      fetchEstadoPendiente();
    }
  }, [isSupervisor]);

  const fetchExpedientes = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        pagina: pagination.page,
        limite: pagination.limit,
        busqueda: search || undefined,
      };

      // Si es supervisor y está en pestaña pendientes, filtrar por estado "Pendiente de Revisión"
      if (isSupervisor && activeTab === 'pendientes' && idEstadoPendiente) {
        params.idEstado = idEstadoPendiente;
      }

      const response = await axiosInstance.get('/expedientes', { params });

      if (response.data.success) {
        setExpedientes(response.data.data.expedientes);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.total,
          totalPages: response.data.data.total_paginas,
        }));
      }
    } catch (error) {
      console.error('Error fetching expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo fetch si no es supervisor o si ya tenemos el ID del estado pendiente
    if (!isSupervisor || idEstadoPendiente !== null || activeTab === 'todos') {
      fetchExpedientes();
    }
  }, [pagination.page, pagination.limit, activeTab, idEstadoPendiente]);

  const handleTabChange = (tab: 'pendientes' | 'todos') => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchExpedientes();
  };

  const columns = [
    {
      key: 'numero_expediente',
      title: 'No. Expediente',
      render: (value: string) => (
        <span className="font-medium text-primary-600">{value}</span>
      ),
    },
    {
      key: 'numero_caso_mp',
      title: 'Caso MP',
      render: (value: string | null) => value || '-',
    },
    {
      key: 'tecnico_nombre',
      title: 'Técnico',
      render: (_: any, record: Expediente) => (
        <span>{`${record.tecnico_nombre} ${record.tecnico_apellido}`}</span>
      ),
    },
    {
      key: 'nombre_unidad',
      title: 'Unidad',
    },
    {
      key: 'nombre_estado',
      title: 'Estado',
      render: (value: string, record: Expediente) => (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${record.estado_color}20`,
            color: record.estado_color,
          }}
        >
          {value === 'Aprobado' && <CheckCircleOutlined />}
          {value === 'Rechazado' && <CloseCircleOutlined />}
          {value === 'En Proceso' && <ClockCircleOutlined />}
          {value === 'En Revisión' && <ExclamationCircleOutlined />}
          {value}
        </span>
      ),
    },
    {
      key: 'urgencia',
      title: 'Urgencia',
      render: (value: string | null) =>
        value ? (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${urgenciaColors[value] || 'bg-gray-100'}`}
          >
            {urgenciaLabels[value] || value}
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'total_indicios',
      title: 'Indicios',
      render: (value: number) => (
        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium bg-gray-100 rounded-full">
          {value}
        </span>
      ),
    },
    {
      key: 'acciones',
      title: 'Acciones',
      render: (_: any, record: Expediente) => {
        const isCreator = user?.id === record.id_usuario_registro;
        const isRechazado = record.nombre_estado === 'Rechazado';
        const canEditExpediente = canEdit && isRechazado && isCreator;

        return (
          <div className="flex gap-2">
            {canView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/expedientes/${record.id_expediente}`);
                }}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Ver detalle"
              >
                <EyeOutlined className="text-lg" />
              </button>
            )}
            {canEditExpediente && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/expedientes/${record.id_expediente}/editar`);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar expediente"
              >
                <EditOutlined className="text-lg" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar userName={userName} userRole={userRole} />

      <main className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
              <p className="text-gray-500">
                {userRole === 'TECNICO'
                  ? 'Tus expedientes asignados'
                  : 'Gestión de todos los expedientes'}
              </p>
            </div>
            {canCreate && (
              <button
                onClick={() => navigate('/expedientes/nuevo')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <PlusOutlined />
                Nuevo Expediente
              </button>
            )}
          </div>

          {/* Tabs para Supervisor */}
          {isSupervisor && (
            <div className="mb-6 bg-white rounded-lg shadow-sm">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => handleTabChange('pendientes')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'pendientes'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pendientes de Revisión
                </button>
                <button
                  onClick={() => handleTabChange('todos')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'todos'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <SearchOutlined className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por número de expediente, caso MP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-hidden bg-white rounded-lg shadow-sm">
            <DataTable
              columns={columns}
              data={expedientes}
              loading={loading}
              keyExtractor={(item) => item.id_expediente}
              onRowClick={(record) => navigate(`/expedientes/${record.id_expediente}`)}
            />

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
