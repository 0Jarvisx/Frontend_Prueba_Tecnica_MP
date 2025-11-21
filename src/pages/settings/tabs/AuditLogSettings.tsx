import { useState } from 'react';
import { SearchOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import { DataTable } from '../../../components/common/DataTable';
import { Pagination } from '../../../components/common/Pagination';

// Mock data para demostración
const mockAuditLogs = [
  {
    id: 1,
    usuario: 'Juan Pérez',
    accion: 'Creó usuario',
    detalles: 'Nuevo usuario: maria@example.com',
    ip: '192.168.1.100',
    fecha: '2024-01-15 10:30:00',
    tipo: 'create',
  },
  {
    id: 2,
    usuario: 'Admin Sistema',
    accion: 'Modificó rol',
    detalles: 'Cambió permisos del rol Analista',
    ip: '192.168.1.1',
    fecha: '2024-01-15 09:15:00',
    tipo: 'update',
  },
  {
    id: 3,
    usuario: 'Pedro González',
    accion: 'Eliminó expediente',
    detalles: 'Expediente #2024-1234',
    ip: '192.168.1.105',
    fecha: '2024-01-14 16:45:00',
    tipo: 'delete',
  },
  {
    id: 4,
    usuario: 'María López',
    accion: 'Inició sesión',
    detalles: 'Login exitoso',
    ip: '192.168.1.110',
    fecha: '2024-01-14 08:00:00',
    tipo: 'login',
  },
  {
    id: 5,
    usuario: 'Carlos Ramírez',
    accion: 'Exportó reporte',
    detalles: 'Reporte mensual - Enero 2024',
    ip: '192.168.1.115',
    fecha: '2024-01-13 14:30:00',
    tipo: 'export',
  },
];

interface AuditLog {
  id: number;
  usuario: string;
  accion: string;
  detalles: string;
  ip: string;
  fecha: string;
  tipo: string;
}

const AuditLogSettings = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const getTipoBadge = (tipo: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      create: { bg: 'bg-green-100', text: 'text-green-800', label: 'Creación' },
      update: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Actualización' },
      delete: { bg: 'bg-red-100', text: 'text-red-800', label: 'Eliminación' },
      login: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Login' },
      export: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Exportación' },
    };

    const badge = badges[tipo] || { bg: 'bg-gray-100', text: 'text-gray-800', label: tipo };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'fecha',
      title: 'Fecha y Hora',
      render: (fecha: string) => (
        <div className="text-sm text-gray-900">{fecha}</div>
      ),
      width: '180px',
    },
    {
      key: 'usuario',
      title: 'Usuario',
      render: (usuario: string) => (
        <div className="text-sm font-medium text-gray-900">{usuario}</div>
      ),
    },
    {
      key: 'accion',
      title: 'Acción',
      render: (accion: string, record: AuditLog) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{accion}</div>
          <div className="text-xs text-gray-500">{record.detalles}</div>
        </div>
      ),
    },
    {
      key: 'tipo',
      title: 'Tipo',
      render: (tipo: string) => getTipoBadge(tipo),
      width: '120px',
    },
    {
      key: 'ip',
      title: 'IP',
      render: (ip: string) => (
        <span className="text-sm text-gray-600">{ip}</span>
      ),
      width: '140px',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bitácora del Sistema</h2>
            <p className="text-gray-600 text-sm mt-1">
              Registro de todas las acciones realizadas en el sistema
            </p>
          </div>
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <DownloadOutlined />
            Exportar
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchOutlined className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por usuario, acción o detalles..."
              className="input-field pl-10 w-full"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-full md:w-48"
          >
            <option value="all">Todos los tipos</option>
            <option value="create">Creación</option>
            <option value="update">Actualización</option>
            <option value="delete">Eliminación</option>
            <option value="login">Login</option>
            <option value="export">Exportación</option>
          </select>

          <button onClick={handleSearch} className="btn-primary">
            <FilterOutlined className="mr-2" />
            Filtrar
          </button>

          {search && (
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setFilterType('all');
                setPage(1);
              }}
              className="btn-secondary"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={mockAuditLogs}
          loading={false}
          keyExtractor={(record) => record.id}
        />
        <Pagination
          currentPage={page}
          totalPages={3}
          onPageChange={setPage}
          totalItems={mockAuditLogs.length}
          itemsPerPage={10}
        />
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Información</h3>
            <p className="text-sm text-blue-800 mt-1">
              Los registros de la bitácora se conservan por 90 días. Todas las acciones críticas
              quedan registradas automáticamente con fecha, hora, usuario y dirección IP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogSettings;
