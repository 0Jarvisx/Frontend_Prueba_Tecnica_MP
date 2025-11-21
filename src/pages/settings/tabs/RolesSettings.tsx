import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';
import { useApi, useLazyApi } from '../../../hooks/useApi';
import { DataTable } from '../../../components/common/DataTable';
import { Pagination } from '../../../components/common/Pagination';

// Schema de validación para crear rol
const createRolSchema = z.object({
  nombreRol: z.string().min(2, 'El nombre del rol debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
});

// Schema de validación para editar rol
const updateRolSchema = z.object({
  nombreRol: z.string().min(2, 'El nombre del rol debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  activo: z.boolean(),
});

type CreateRolFormData = z.infer<typeof createRolSchema>;
type UpdateRolFormData = z.infer<typeof updateRolSchema>;

interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  total_permisos: number;
}

interface Permiso {
  id_permiso: number;
  nombre_permiso: string;
  descripcion: string | null;
  modulo: string | null;
}

const RolesSettings = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [selectedRol, setSelectedRol] = useState<number | null>(null);
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Obtener roles
  const { data: rolesData, loading: loadingRoles, execute: fetchRoles } = useApi<{
    data: { total: number; pagina: number; limite: number; total_paginas: number; roles: Rol[] };
  }>('/roles', 'GET', { showErrorMessage: true });

  // Obtener todos los permisos
  const { data: permisosData, execute: fetchPermisos } = useApi<{ data: { permisos: Permiso[] } }>(
    '/permisos/all',
    'GET',
    { showErrorMessage: true }
  );

  // Obtener rol con permisos
  const { execute: fetchRolWithPermisos } = useLazyApi<{
    data: { permisos: Permiso[] };
  }>({ showErrorMessage: true });

  // Crear/Actualizar rol
  const { loading: savingRol, execute: executeSaveRol } = useLazyApi({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  // Eliminar rol
  const { loading: deletingRol, execute: executeDeleteRol } = useLazyApi({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  // Asignar permisos
  const { loading: assigningPermisos, execute: executeAssignPermisos } = useLazyApi({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  // Form para crear rol
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    reset: resetCreate,
  } = useForm<CreateRolFormData>({
    resolver: zodResolver(createRolSchema),
  });

  // Form para editar rol
  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errorsUpdate },
    reset: resetUpdate,
    setValue: setValueUpdate,
  } = useForm<UpdateRolFormData>({
    resolver: zodResolver(updateRolSchema),
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const loadRoles = () => {
    const params = new URLSearchParams({
      pagina: page.toString(),
      limite: '10',
    });
    if (search) {
      params.append('busqueda', search);
    }
    fetchRoles({ params: Object.fromEntries(params) });
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCreate = async (data: CreateRolFormData) => {
    const response = await executeSaveRol('/roles', 'POST', data);
    if (response) {
      setShowModal(false);
      resetCreate();
      loadRoles();
    }
  };

  const handleEdit = (rol: Rol) => {
    setEditingRol(rol);
    setValueUpdate('nombreRol', rol.nombre_rol);
    setValueUpdate('descripcion', rol.descripcion || '');
    setValueUpdate('activo', rol.activo);
    setShowModal(true);
  };

  const handleUpdate = async (data: UpdateRolFormData) => {
    if (!editingRol) return;

    const response = await executeSaveRol(`/roles/${editingRol.id_rol}`, 'PUT', data);
    if (response) {
      setShowModal(false);
      setEditingRol(null);
      resetUpdate();
      loadRoles();
    }
  };

  const handleDelete = async (rolId: number) => {
    if (!confirm('¿Está seguro de eliminar este rol?')) return;

    const response = await executeDeleteRol(`/roles/${rolId}`, 'DELETE');
    if (response) {
      loadRoles();
    }
  };

  const handleOpenPermisos = async (rolId: number) => {
    setSelectedRol(rolId);

    // Obtener permisos del rol
    const response = await fetchRolWithPermisos(`/roles/${rolId}`, 'GET');
    if (response?.data) {
      const permisosAsignados = response.data.permisos.map((p: Permiso) => p.id_permiso);
      setSelectedPermisos(permisosAsignados);
    }

    // Obtener todos los permisos disponibles
    await fetchPermisos();

    setShowPermisosModal(true);
  };

  const handleAssignPermisos = async () => {
    if (!selectedRol) return;

    const response = await executeAssignPermisos(`/roles/${selectedRol}/permisos`, 'POST', {
      permisos: selectedPermisos,
    });

    if (response) {
      setShowPermisosModal(false);
      setSelectedRol(null);
      setSelectedPermisos([]);
      loadRoles();
    }
  };

  const togglePermiso = (permisoId: number) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoId) ? prev.filter((id) => id !== permisoId) : [...prev, permisoId]
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRol(null);
    resetCreate();
    resetUpdate();
  };

  const closePermisosModal = () => {
    setShowPermisosModal(false);
    setSelectedRol(null);
    setSelectedPermisos([]);
  };

  const roles = rolesData?.data?.roles || [];
  const totalPages = rolesData?.data?.total_paginas || 1;
  const total = rolesData?.data?.total || 0;
  const permisos = permisosData?.data?.permisos || [];

  // Agrupar permisos por módulo
  const permisosPorModulo = permisos.reduce((acc, permiso) => {
    const modulo = permiso.modulo || 'Sin módulo';
    if (!acc[modulo]) {
      acc[modulo] = [];
    }
    acc[modulo].push(permiso);
    return acc;
  }, {} as Record<string, Permiso[]>);

  const columns = [
    {
      key: 'nombre_rol',
      title: 'Rol',
      render: (nombreRol: string) => (
        <div className="text-sm font-medium text-gray-900">{nombreRol}</div>
      ),
    },
    {
      key: 'descripcion',
      title: 'Descripción',
      render: (descripcion: string | null) => (
        <div className="text-sm text-gray-900 max-w-md truncate">
          {descripcion || 'Sin descripción'}
        </div>
      ),
    },
    {
      key: 'total_permisos',
      title: 'Permisos',
      render: (_: any, record: Rol) => (
        <button
          onClick={() => handleOpenPermisos(record.id_rol)}
          className="text-primary-600 hover:text-primary-900 text-sm flex items-center gap-1"
        >
          <SafetyOutlined />
          {record.total_permisos} permiso{record.total_permisos !== 1 ? 's' : ''}
        </button>
      ),
    },
    {
      key: 'activo',
      title: 'Estado',
      render: (activo: boolean) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_: any, record: Rol) => (
        <div className="flex gap-3">
          <button
            onClick={() => handleEdit(record)}
            className="text-primary-600 hover:text-primary-900"
          >
            <EditOutlined />
          </button>
          <button
            onClick={() => handleDelete(record.id_rol)}
            disabled={deletingRol}
            className="text-red-600 hover:text-red-900"
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
      width: '120px',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestión de Roles y Permisos</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra los roles y permisos del sistema
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRol(null);
              resetCreate();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <PlusOutlined />
            Nuevo Rol
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchOutlined className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por nombre o descripción..."
              className="input-field pl-10 w-full"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary">
            Buscar
          </button>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
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
          data={roles}
          loading={loadingRoles}
          keyExtractor={(record) => record.id_rol}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
          itemsPerPage={10}
        />
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingRol ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
            </div>

            <form
              onSubmit={
                editingRol ? handleSubmitUpdate(handleUpdate) : handleSubmitCreate(handleCreate)
              }
              className="p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Nombre del Rol *
                </label>
                <input
                  {...(editingRol ? registerUpdate('nombreRol') : registerCreate('nombreRol'))}
                  type="text"
                  className={`input-field ${
                    (editingRol ? errorsUpdate : errorsCreate).nombreRol ? 'input-error' : ''
                  }`}
                  placeholder="Ej: Administrador, Técnico, Supervisor"
                />
                {(editingRol ? errorsUpdate : errorsCreate).nombreRol && (
                  <p className="mt-1 text-sm text-red-500">
                    {(editingRol ? errorsUpdate : errorsCreate).nombreRol?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Descripción</label>
                <textarea
                  {...(editingRol
                    ? registerUpdate('descripcion')
                    : registerCreate('descripcion'))}
                  rows={3}
                  className="input-field"
                  placeholder="Descripción del rol y sus responsabilidades"
                />
              </div>

              {editingRol && (
                <div className="flex items-center">
                  <input
                    {...registerUpdate('activo')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Rol activo</label>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="submit" disabled={savingRol} className="btn-primary">
                  {savingRol ? 'Guardando...' : editingRol ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Permisos */}
      {showPermisosModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Asignar Permisos al Rol</h2>
              <p className="text-sm text-gray-600 mt-1">
                Selecciona los permisos que tendrá este rol
              </p>
            </div>

            <div className="p-6 space-y-6">
              {Object.keys(permisosPorModulo).length === 0 ? (
                <div className="text-center p-8 text-gray-500">No hay permisos disponibles</div>
              ) : (
                Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => (
                  <div key={modulo} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{modulo}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permisosModulo.map((permiso) => (
                        <div key={permiso.id_permiso} className="flex items-start">
                          <input
                            type="checkbox"
                            checked={selectedPermisos.includes(permiso.id_permiso)}
                            onChange={() => togglePermiso(permiso.id_permiso)}
                            className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="ml-3">
                            <label className="block text-sm font-medium text-gray-900">
                              {permiso.nombre_permiso}
                            </label>
                            {permiso.descripcion && (
                              <p className="text-xs text-gray-500">{permiso.descripcion}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleAssignPermisos}
                disabled={assigningPermisos}
                className="btn-primary"
              >
                {assigningPermisos ? 'Guardando...' : 'Guardar Permisos'}
              </button>
              <button onClick={closePermisosModal} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesSettings;
