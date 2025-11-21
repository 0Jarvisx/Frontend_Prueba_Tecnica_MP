import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { axiosInstance } from '../../config/axios.config';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { DocumentosUploader } from '../../components/documentos/DocumentosUploader';

interface Expediente {
  id_expediente: number;
  numero_expediente: string;
  numero_caso_mp: string | null;
  fecha_registro: string;
  id_usuario_registro: number;
  tecnico_nombre: string;
  tecnico_apellido: string;
  tecnico_email: string;
  supervisor_nombre: string | null;
  supervisor_apellido: string | null;
  fiscalia_nombre: string;
  fiscalia_codigo: string;
  nombre_unidad: string;
  codigo_unidad: string;
  especialidad: string | null;
  nombre_estado: string;
  estado_color: string;
  estado_descripcion: string | null;
  tipo_analisis: string | null;
  fiscal_solicitante: string | null;
  oficio_solicitud: string | null;
  urgencia: string | null;
  fecha_limite: string | null;
  tipo_delito: string | null;
  lugar_hecho: string | null;
  fecha_hecho: string | null;
  descripcion_caso: string | null;
  observaciones: string | null;
  departamento_nombre: string | null;
  municipio_nombre: string | null;
}

interface Indicio {
  id_indicio: number;
  numero_indicio: string;
  descripcion: string;
  tipo_objeto: string | null;
  estado_nombre: string;
  cantidad: number;
}

interface RechazoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  loading: boolean;
}

const RechazoModal = ({ isOpen, onClose, onConfirm, loading }: RechazoModalProps) => {
  const [motivo, setMotivo] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CloseCircleOutlined className="text-red-500" />
            Rechazar Expediente
          </h3>
        </div>
        <div className="p-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Motivo del rechazo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describe el motivo del rechazo y las correcciones necesarias..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px]"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Este mensaje se enviará por correo al técnico asignado.
          </p>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(motivo)}
            disabled={loading || !motivo.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CloseCircleOutlined />
            )}
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExpedienteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [indicios, setIndicios] = useState<Indicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const userName = user ? `${user.nombre} ${user.apellido}` : '';
  const userRole = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombreRol || '';
  const { hasPermissionById } = usePermissions();

  // Permisos: 5=aprobar expedientes, 6=crear indicios
  const canApprove = hasPermissionById(5);
  const canCreateIndicio = hasPermissionById(6);

  const fetchExpediente = async () => {
    setLoading(true);
    try {
      const [expResponse, indResponse] = await Promise.all([
        axiosInstance.get(`/expedientes/${id}`),
        axiosInstance.get(`/indicios?idExpediente=${id}`),
      ]);

      if (expResponse.data.success) {
        setExpediente(expResponse.data.data);
      }
      if (indResponse.data.success) {
        setIndicios(indResponse.data.data.indicios);
      }
    } catch (error) {
      console.error('Error fetching expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchExpediente();
  }, [id]);

  const handleAprobar = async () => {
    setActionLoading(true);
    try {
      const response = await axiosInstance.post(`/expedientes/${id}/aprobar`);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Expediente aprobado exitosamente' });
        fetchExpediente();
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al aprobar el expediente',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (motivo: string) => {
    setActionLoading(true);
    try {
      const response = await axiosInstance.post(`/expedientes/${id}/rechazar`, {
        motivoRechazo: motivo,
      });
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Expediente rechazado. Se ha notificado al técnico por correo.',
        });
        setShowRechazoModal(false);
        fetchExpediente();
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al rechazar el expediente',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <DashboardSidebar userName={userName} userRole={userRole} />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </main>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <DashboardSidebar userName={userName} userRole={userRole} />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Expediente no encontrado</h2>
            <button
              onClick={() => navigate('/expedientes')}
              className="mt-4 text-primary-600 hover:underline"
            >
              Volver a expedientes
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Determinar si el usuario actual es el creador del expediente
  const isCreator = user?.id === expediente.id_usuario_registro;

  // Solo el creador puede editar cuando está rechazado
  const canEditExpediente = expediente.nombre_estado === 'Rechazado' && isCreator;

  // Determinar si se pueden editar documentos:
  // - Solo en estado "En Revisión" se pueden subir documentos desde la vista de detalle
  // - En "Rechazado": NO se pueden subir documentos, deben editar el expediente primero
  // - En "Aprobado": solo lectura
  const canEditDocuments = expediente.nombre_estado === 'En Revisión';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar userName={userName} userRole={userRole} />

      <main className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/expedientes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftOutlined />
              Volver a expedientes
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {expediente.numero_expediente}
                  </h1>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${expediente.estado_color}20`,
                      color: expediente.estado_color,
                    }}
                  >
                    {expediente.nombre_estado}
                  </span>
                </div>
                {expediente.numero_caso_mp && (
                  <p className="text-gray-500 mt-1">Caso MP: {expediente.numero_caso_mp}</p>
                )}
              </div>

              <div className="flex gap-3">
                {canEditExpediente && (
                  <button
                    onClick={() => navigate(`/expedientes/${id}/editar`)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Editar Expediente
                  </button>
                )}
                {canApprove && expediente.nombre_estado === 'En Revisión' && (
                  <>
                    <button
                      onClick={() => setShowRechazoModal(true)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <CloseCircleOutlined />
                      Rechazar
                    </button>
                    <button
                      onClick={handleAprobar}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <CheckCircleOutlined />
                      Aprobar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 mb-6 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              {message.text}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {/* Técnico */}
            <div className="p-5 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <UserOutlined className="text-lg text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Técnico Asignado</h3>
              </div>
              <p className="text-gray-900 font-medium">
                {expediente.tecnico_nombre} {expediente.tecnico_apellido}
              </p>
              <p className="text-sm text-gray-500">{expediente.tecnico_email}</p>
            </div>

            {/* Fiscalía */}
            <div className="p-5 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BankOutlined className="text-lg text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Fiscalía</h3>
              </div>
              <p className="text-gray-900 font-medium">{expediente.fiscalia_nombre}</p>
              <p className="text-sm text-gray-500">Código: {expediente.fiscalia_codigo}</p>
            </div>

            {/* Unidad */}
            <div className="p-5 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileTextOutlined className="text-lg text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Unidad</h3>
              </div>
              <p className="text-gray-900 font-medium">{expediente.nombre_unidad}</p>
              <p className="text-sm text-gray-500">{expediente.especialidad || '-'}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Caso</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Tipo de Delito</dt>
                  <dd className="font-medium text-gray-900">{expediente.tipo_delito || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Departamento</dt>
                  <dd className="font-medium text-gray-900">{expediente.departamento_nombre || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Municipio</dt>
                  <dd className="font-medium text-gray-900">{expediente.municipio_nombre || '-'}</dd>
                </div>
              </dl>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas y Urgencia</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fecha de Registro</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(expediente.fecha_registro).toLocaleDateString('es-GT')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Urgencia</dt>
                  <dd>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        expediente.urgencia === 'muy_urgente'
                          ? 'bg-red-100 text-red-800'
                          : expediente.urgencia === 'urgente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {expediente.urgencia === 'muy_urgente'
                        ? 'Muy Urgente'
                        : expediente.urgencia === 'urgente'
                          ? 'Urgente'
                          : 'Ordinario'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Descripción */}
          {expediente.descripcion_caso && (
            <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción del Caso</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{expediente.descripcion_caso}</p>
            </div>
          )}

          {/* Observaciones */}
          {expediente.observaciones && (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <ExclamationCircleOutlined />
                Observaciones
              </h3>
              <p className="text-yellow-900 whitespace-pre-wrap">{expediente.observaciones}</p>
            </div>
          )}

          {/* Documentos del Expediente */}
          <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PaperClipOutlined />
              Documentos del Expediente
              {!canEditDocuments && (
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Solo lectura - El expediente está {expediente.nombre_estado})
                </span>
              )}
            </h3>
            <DocumentosUploader
              idExpediente={expediente.id_expediente}
              readOnly={!canEditDocuments}
            />
          </div>

          {/* Indicios */}
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Indicios ({indicios.length})
              </h3>
              {canCreateIndicio && canEditDocuments && (
                <button
                  onClick={() => navigate(`/expedientes/${id}/indicios/nuevo`)}
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  + Agregar Indicio
                </button>
              )}
            </div>
            {indicios.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay indicios registrados</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {indicios.map((indicio) => (
                  <div key={indicio.id_indicio} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {indicio.numero_indicio} - {indicio.tipo_objeto || 'Sin tipo'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{indicio.descripcion}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                          Cant: {indicio.cantidad}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {indicio.estado_nombre}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 mt-2">
                      <p className="text-sm font-medium text-gray-600 mb-2">Documentos del indicio:</p>
                      <DocumentosUploader
                        idExpediente={expediente.id_expediente}
                        idIndicio={indicio.id_indicio}
                        readOnly={!canEditDocuments}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <RechazoModal
        isOpen={showRechazoModal}
        onClose={() => setShowRechazoModal(false)}
        onConfirm={handleRechazar}
        loading={actionLoading}
      />
    </div>
  );
};
