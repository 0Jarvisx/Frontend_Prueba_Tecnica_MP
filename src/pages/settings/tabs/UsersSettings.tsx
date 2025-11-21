import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useApi, useLazyApi } from '../../../hooks/useApi';
import { DataTable } from '../../../components/common/DataTable';
import { Pagination } from '../../../components/common/Pagination';

// Schemas
const createUserSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  dpi: z.string().optional(),
  telefono: z.string().optional(),
  idRol: z.number().min(1, 'Debe seleccionar un rol'),
});

const updateUserSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  dpi: z.string().optional(),
  telefono: z.string().optional(),
  idRol: z.number().min(1, 'Debe seleccionar un rol'),
  activo: z.boolean(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  dpi: string | null;
  telefono: string | null;
  activo: boolean;
  id_rol: number;
  nombre_rol: string;
  created_at: string;
  updated_at: string;
}

interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion: string;
}

const UsersSettings = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: rolesData, execute: fetchRoles } = useApi<{ data: { roles: Rol[] } }>(
    '/users/roles',
    'GET',
    { showErrorMessage: true }
  );

  const { data: usersData, loading: loadingUsers, execute: fetchUsers } = useApi<{
    data: { total: number; pagina: number; limite: number; total_paginas: number; usuarios: Usuario[] };
  }>('/users', 'GET', { showErrorMessage: true });

  const { loading: savingUser, execute: executeSaveUser } = useLazyApi({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  const { loading: deletingUser, execute: executeDeleteUser } = useLazyApi({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    reset: resetCreate,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errorsUpdate },
    reset: resetUpdate,
    setValue: setValueUpdate,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const loadUsers = () => {
    const params = new URLSearchParams({
      pagina: page.toString(),
      limite: '10',
    });
    if (search) {
      params.append('busqueda', search);
    }
    fetchUsers({ params: Object.fromEntries(params) });
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCreate = async (data: CreateUserFormData) => {
    const response = await executeSaveUser('/users', 'POST', data);
    if (response) {
      setShowModal(false);
      resetCreate();
      loadUsers();
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setValueUpdate('nombre', user.nombre);
    setValueUpdate('apellido', user.apellido);
    setValueUpdate('email', user.email);
    setValueUpdate('dpi', user.dpi || '');
    setValueUpdate('telefono', user.telefono || '');
    setValueUpdate('idRol', user.id_rol);
    setValueUpdate('activo', user.activo);
    setShowModal(true);
  };

  const handleUpdate = async (data: UpdateUserFormData) => {
    if (!editingUser) return;
    const response = await executeSaveUser(`/users/${editingUser.id_usuario}`, 'PUT', data);
    if (response) {
      setShowModal(false);
      setEditingUser(null);
      resetUpdate();
      loadUsers();
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    const response = await executeDeleteUser(`/users/${userId}`, 'DELETE');
    if (response) {
      loadUsers();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    resetCreate();
    resetUpdate();
  };

  const roles = rolesData?.data?.roles || [];
  const usuarios = usersData?.data?.usuarios || [];
  const totalPages = usersData?.data?.total_paginas || 1;
  const total = usersData?.data?.total || 0;

  const columns = [
    {
      key: 'nombre',
      title: 'Usuario',
      render: (_: any, record: Usuario) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {record.nombre} {record.apellido}
          </div>
          <div className="text-sm text-gray-500">{record.telefono || 'Sin teléfono'}</div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (email: string) => <span className="text-sm text-gray-900">{email}</span>,
    },
    {
      key: 'dpi',
      title: 'DPI',
      render: (dpi: string | null) => (
        <span className="text-sm text-gray-900">{dpi || 'Sin DPI'}</span>
      ),
    },
    {
      key: 'nombre_rol',
      title: 'Rol',
      render: (rol: string) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
          {rol}
        </span>
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
      render: (_: any, record: Usuario) => (
        <div className="flex gap-3">
          <button
            onClick={() => handleEdit(record)}
            className="text-primary-600 hover:text-primary-900"
          >
            <EditOutlined />
          </button>
          <button
            onClick={() => handleDelete(record.id_usuario)}
            disabled={deletingUser}
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
            <h2 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-gray-600 text-sm mt-1">Administra los usuarios del sistema</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              resetCreate();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <PlusOutlined />
            Nuevo Usuario
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
              placeholder="Buscar por nombre, email o DPI..."
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
          data={usuarios}
          loading={loadingUsers}
          keyExtractor={(record) => record.id_usuario}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
          itemsPerPage={10}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              {!editingUser && (
                <p className="text-sm text-gray-600 mt-2">
                  Se generará una contraseña aleatoria y se enviará al correo del usuario
                </p>
              )}
            </div>

            <form
              onSubmit={
                editingUser
                  ? handleSubmitUpdate(handleUpdate)
                  : handleSubmitCreate(handleCreate)
              }
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Nombre *</label>
                  <input
                    {...(editingUser ? registerUpdate('nombre') : registerCreate('nombre'))}
                    type="text"
                    className={`input-field ${
                      (editingUser ? errorsUpdate : errorsCreate).nombre ? 'input-error' : ''
                    }`}
                  />
                  {(editingUser ? errorsUpdate : errorsCreate).nombre && (
                    <p className="mt-1 text-sm text-red-500">
                      {(editingUser ? errorsUpdate : errorsCreate).nombre?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Apellido *
                  </label>
                  <input
                    {...(editingUser ? registerUpdate('apellido') : registerCreate('apellido'))}
                    type="text"
                    className={`input-field ${
                      (editingUser ? errorsUpdate : errorsCreate).apellido ? 'input-error' : ''
                    }`}
                  />
                  {(editingUser ? errorsUpdate : errorsCreate).apellido && (
                    <p className="mt-1 text-sm text-red-500">
                      {(editingUser ? errorsUpdate : errorsCreate).apellido?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email *</label>
                  <input
                    {...(editingUser ? registerUpdate('email') : registerCreate('email'))}
                    type="email"
                    className={`input-field ${
                      (editingUser ? errorsUpdate : errorsCreate).email ? 'input-error' : ''
                    }`}
                  />
                  {(editingUser ? errorsUpdate : errorsCreate).email && (
                    <p className="mt-1 text-sm text-red-500">
                      {(editingUser ? errorsUpdate : errorsCreate).email?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">DPI</label>
                  <input
                    {...(editingUser ? registerUpdate('dpi') : registerCreate('dpi'))}
                    type="text"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Teléfono</label>
                  <input
                    {...(editingUser ? registerUpdate('telefono') : registerCreate('telefono'))}
                    type="tel"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Rol *</label>
                  <select
                    {...(editingUser
                      ? registerUpdate('idRol', { valueAsNumber: true })
                      : registerCreate('idRol', { valueAsNumber: true }))}
                    className={`input-field ${
                      (editingUser ? errorsUpdate : errorsCreate).idRol ? 'input-error' : ''
                    }`}
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.id_rol}>
                        {rol.nombre_rol}
                      </option>
                    ))}
                  </select>
                  {(editingUser ? errorsUpdate : errorsCreate).idRol && (
                    <p className="mt-1 text-sm text-red-500">
                      {(editingUser ? errorsUpdate : errorsCreate).idRol?.message}
                    </p>
                  )}
                </div>

                {editingUser && (
                  <div className="flex items-center">
                    <input
                      {...registerUpdate('activo')}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Usuario activo</label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="submit" disabled={savingUser} className="btn-primary">
                  {savingUser ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersSettings;
