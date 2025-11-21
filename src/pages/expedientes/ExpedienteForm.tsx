import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import { useAuthStore } from '../../store/auth.store';
import { axiosInstance } from '../../config/axios.config';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { PendingDocumentsUploader, DocumentosUploader } from '../../components/documentos/DocumentosUploader';
import type { PendingFile } from '../../components/documentos/DocumentosUploader';

interface Catalogo {
  id: number;
  nombre: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
}

interface Indicio {
  id_indicio?: number; // Optional, solo existe en indicios existentes
  descripcion: string;
  tipoObjeto: string;
  color: string;
  tamanio: string;
  peso: string;
  pesoUnidad: string;
  ubicacionHallazgo: string;
  observaciones: string;
  cantidad: string;
  archivos: PendingFile[];
}

const emptyIndicio: Indicio = {
  descripcion: '',
  tipoObjeto: '',
  color: '',
  tamanio: '',
  peso: '',
  pesoUnidad: 'gramos',
  ubicacionHallazgo: '',
  observaciones: '',
  cantidad: '1',
  archivos: [],
};

export const ExpedienteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [loadingExpediente, setLoadingExpediente] = useState(false);
  const [error, setError] = useState('');
  const [numeroExpediente, setNumeroExpediente] = useState('');

  // Catálogos
  const [estados, setEstados] = useState<Catalogo[]>([]);
  const [unidades, setUnidades] = useState<Catalogo[]>([]);
  const [fiscalias, setFiscalias] = useState<Catalogo[]>([]);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [departamentos, setDepartamentos] = useState<Catalogo[]>([]);
  const [municipios, setMunicipios] = useState<Catalogo[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    numeroCasoMp: '',
    idTecnicoAsignado: '',
    idFiscalia: '',
    idUnidad: '',
    idEstado: '',
    idDepartamento: '',
    idMunicipio: '',
    urgencia: 'ordinario',
    tipoDelito: '',
    observaciones: '',
  });

  // Indicios
  const [indicios, setIndicios] = useState<Indicio[]>([]);
  // Archivos del expediente
  const [archivosExpediente, setArchivosExpediente] = useState<PendingFile[]>([]);

  const userName = user ? `${user.nombre} ${user.apellido}` : '';
  const userRole = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombreRol || '';

  useEffect(() => {
    fetchCatalogos();
    if (isEditMode && id) {
      fetchExpediente(parseInt(id));
    }
  }, [id, isEditMode]);

  const fetchExpediente = async (expedienteId: number) => {
    setLoadingExpediente(true);
    try {
      const [expResponse, indResponse] = await Promise.all([
        axiosInstance.get(`/expedientes/${expedienteId}`),
        axiosInstance.get(`/indicios?idExpediente=${expedienteId}`),
      ]);

      if (expResponse.data.success) {
        const exp = expResponse.data.data;
        setNumeroExpediente(exp.numero_expediente);
        setFormData({
          numeroCasoMp: exp.numero_caso_mp || '',
          idTecnicoAsignado: exp.id_tecnico_asignado?.toString() || '',
          idFiscalia: exp.id_fiscalia?.toString() || '',
          idUnidad: exp.id_unidad?.toString() || '',
          idEstado: exp.id_estado?.toString() || '',
          idDepartamento: exp.id_departamento?.toString() || '',
          idMunicipio: exp.id_municipio?.toString() || '',
          urgencia: exp.urgencia || 'ordinario',
          tipoDelito: exp.tipo_delito || '',
          observaciones: exp.observaciones || '',
        });

        // Cargar municipios si hay departamento seleccionado
        if (exp.id_departamento) {
          fetchMunicipios(exp.id_departamento);
        }
      }

      // Cargar indicios existentes
      if (indResponse.data.success && indResponse.data.data.indicios) {
        const indiciosExistentes = indResponse.data.data.indicios.map((ind: any) => ({
          id_indicio: ind.id_indicio,
          descripcion: ind.descripcion || '',
          tipoObjeto: ind.tipo_objeto || '',
          color: ind.color || '',
          tamanio: ind.tamanio || '',
          peso: ind.peso?.toString() || '',
          pesoUnidad: ind.peso_unidad || 'gramos',
          ubicacionHallazgo: ind.ubicacion_hallazgo || '',
          observaciones: ind.observaciones || '',
          cantidad: ind.cantidad?.toString() || '1',
          archivos: [],
        }));
        setIndicios(indiciosExistentes);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar expediente');
    } finally {
      setLoadingExpediente(false);
    }
  };

  const fetchCatalogos = async () => {
    setLoadingCatalogos(true);
    try {
      const [estadosRes, unidadesRes, fiscaliasRes, tecnicosRes, departamentosRes] = await Promise.all([
        axiosInstance.get('/catalogos/estados-expediente'),
        axiosInstance.get('/catalogos/unidades'),
        axiosInstance.get('/catalogos/fiscalias'),
        axiosInstance.get('/catalogos/tecnicos'),
        axiosInstance.get('/catalogos/departamentos'),
      ]);

      if (estadosRes.data.success) setEstados(estadosRes.data.data || []);
      if (unidadesRes.data.success) setUnidades(unidadesRes.data.data || []);
      if (fiscaliasRes.data.success) setFiscalias(fiscaliasRes.data.data || []);
      if (tecnicosRes.data.success) setTecnicos(tecnicosRes.data.data || []);
      if (departamentosRes.data.success) setDepartamentos(departamentosRes.data.data || []);
    } catch (err) {
      console.error('Error cargando catálogos:', err);
      setError('Error al cargar los catálogos');
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const fetchMunicipios = async (idDepartamento: number) => {
    try {
      const response = await axiosInstance.get(`/catalogos/municipios/${idDepartamento}`);
      if (response.data.success) {
        setMunicipios(response.data.data || []);
      }
    } catch (err) {
      console.error('Error cargando municipios:', err);
      setMunicipios([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Si cambia el departamento, cargar sus municipios y resetear el municipio seleccionado
    if (name === 'idDepartamento') {
      setFormData((prev) => ({ ...prev, idMunicipio: '' }));
      if (value) {
        fetchMunicipios(parseInt(value));
      } else {
        setMunicipios([]);
      }
    }
  };

  const handleAddIndicio = () => {
    setIndicios([...indicios, { ...emptyIndicio }]);
  };

  const handleRemoveIndicio = (index: number) => {
    setIndicios(indicios.filter((_, i) => i !== index));
  };

  const handleIndicioChange = (index: number, field: keyof Indicio, value: string) => {
    setIndicios(indicios.map((ind, i) => (i === index ? { ...ind, [field]: value } : ind)));
  };

  const handleIndicioFilesChange = (index: number, files: PendingFile[]) => {
    setIndicios(indicios.map((ind, i) => (i === index ? { ...ind, archivos: files } : ind)));
  };

  const uploadFiles = async (idExpediente: number, idIndicio: number | null, files: PendingFile[]) => {
    for (const f of files) {
      const formData = new FormData();
      formData.append('archivo', f.file);
      formData.append('idExpediente', idExpediente.toString());
      if (idIndicio) formData.append('idIndicio', idIndicio.toString());
      formData.append('tipoDocumento', f.tipoDocumento);
      if (f.descripcion) formData.append('descripcion', f.descripcion);
      await axiosInstance.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode && id) {
        // Modo edición: actualizar expediente existente
        const response = await axiosInstance.put(`/expedientes/${id}`, {
          numeroExpediente: numeroExpediente,
          numeroCasoMp: formData.numeroCasoMp || null,
          idTecnicoAsignado: formData.idTecnicoAsignado ? parseInt(formData.idTecnicoAsignado) : null,
          idFiscalia: formData.idFiscalia ? parseInt(formData.idFiscalia) : null,
          idUnidad: formData.idUnidad ? parseInt(formData.idUnidad) : null,
          idEstado: 1, // Volver a "En Revisión" después de editar
          idDepartamento: formData.idDepartamento ? parseInt(formData.idDepartamento) : null,
          idMunicipio: formData.idMunicipio ? parseInt(formData.idMunicipio) : null,
          urgencia: formData.urgencia,
          tipoDelito: formData.tipoDelito || null,
          observaciones: formData.observaciones || null,
        });

        if (response.data.success) {
          // Actualizar indicios existentes y crear nuevos
          for (const indicio of indicios) {
            if (indicio.descripcion.trim() === '') continue; // Saltar indicios vacíos

            if (indicio.id_indicio) {
              // Actualizar indicio existente
              await axiosInstance.put(`/indicios/${indicio.id_indicio}`, {
                numeroIndicio: `IND-${indicio.id_indicio}`,
                descripcion: indicio.descripcion,
                tipoObjeto: indicio.tipoObjeto || null,
                color: indicio.color || null,
                tamanio: indicio.tamanio || null,
                peso: indicio.peso ? parseFloat(indicio.peso) : null,
                pesoUnidad: indicio.pesoUnidad || null,
                ubicacionHallazgo: indicio.ubicacionHallazgo || null,
                idEstadoIndicio: 1,
                observaciones: indicio.observaciones || null,
                cantidad: indicio.cantidad ? parseInt(indicio.cantidad) : 1,
              });

              // Subir nuevos archivos del indicio si hay
              if (indicio.archivos && indicio.archivos.length > 0) {
                await uploadFiles(parseInt(id), indicio.id_indicio, indicio.archivos);
              }
            } else {
              // Crear nuevo indicio
              const indicioResponse = await axiosInstance.post('/indicios', {
                idExpediente: parseInt(id),
                numeroIndicio: `IND-TEMP-${Date.now()}`, // Temporal, el backend generará uno único
                descripcion: indicio.descripcion,
                tipoObjeto: indicio.tipoObjeto || null,
                color: indicio.color || null,
                tamanio: indicio.tamanio || null,
                peso: indicio.peso ? parseFloat(indicio.peso) : null,
                pesoUnidad: indicio.pesoUnidad || null,
                ubicacionHallazgo: indicio.ubicacionHallazgo || null,
                idEstadoIndicio: 1,
                observaciones: indicio.observaciones || null,
                cantidad: indicio.cantidad ? parseInt(indicio.cantidad) : 1,
              });

              // Subir archivos del nuevo indicio si hay
              if (indicioResponse.data.success && indicio.archivos && indicio.archivos.length > 0) {
                const nuevoIndicioId = indicioResponse.data.data.id_indicio;
                await uploadFiles(parseInt(id), nuevoIndicioId, indicio.archivos);
              }
            }
          }
        }

        if (response.data.success) {
          navigate(`/expedientes/${id}`);
        }
      } else {
        // Modo creación: crear expediente con indicios
        const indiciosValidos = indicios.filter((ind) => ind.descripcion.trim() !== '');

        const response = await axiosInstance.post('/expedientes/con-indicios', {
          numeroCasoMp: formData.numeroCasoMp || null,
          idTecnicoAsignado: formData.idTecnicoAsignado ? parseInt(formData.idTecnicoAsignado) : null,
          idFiscalia: formData.idFiscalia ? parseInt(formData.idFiscalia) : null,
          idUnidad: formData.idUnidad ? parseInt(formData.idUnidad) : null,
          idEstado: formData.idEstado ? parseInt(formData.idEstado) : undefined,
          idDepartamento: formData.idDepartamento ? parseInt(formData.idDepartamento) : null,
          idMunicipio: formData.idMunicipio ? parseInt(formData.idMunicipio) : null,
          urgencia: formData.urgencia,
          tipoDelito: formData.tipoDelito || null,
          observaciones: formData.observaciones || null,
          indicios: indiciosValidos.map((ind) => ({
            descripcion: ind.descripcion,
            tipoObjeto: ind.tipoObjeto || null,
            color: ind.color || null,
            tamanio: ind.tamanio || null,
            peso: ind.peso ? parseFloat(ind.peso) : null,
            pesoUnidad: ind.pesoUnidad || null,
            ubicacionHallazgo: ind.ubicacionHallazgo || null,
            observaciones: ind.observaciones || null,
            cantidad: ind.cantidad ? parseInt(ind.cantidad) : 1,
          })),
        });

        if (response.data.success) {
          const { idExpediente, indiciosCreados } = response.data.data;

          // Subir archivos del expediente
          if (archivosExpediente.length > 0) {
            await uploadFiles(idExpediente, null, archivosExpediente);
          }

          // Subir archivos de cada indicio
          if (indiciosCreados && indiciosCreados.length > 0) {
            for (let i = 0; i < indiciosCreados.length; i++) {
              const indicioCreado = indiciosCreados[i];
              const indicioOriginal = indiciosValidos[i];
              if (indicioOriginal?.archivos?.length > 0) {
                await uploadFiles(idExpediente, indicioCreado.idIndicio, indicioOriginal.archivos);
              }
            }
          }

          navigate('/expedientes');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} expediente`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingCatalogos || loadingExpediente) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <DashboardSidebar userName={userName} userRole={userRole} />
        <main className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <LoadingOutlined className="text-4xl text-primary-600" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar userName={userName} userRole={userRole} />

      <main className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(isEditMode ? `/expedientes/${id}` : '/expedientes')}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftOutlined className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? `Editar Expediente ${numeroExpediente}` : 'Nuevo Expediente'}
              </h1>
              <p className="text-gray-500">
                {isEditMode ? 'Actualice los datos del expediente rechazado' : 'Complete los datos del expediente e indicios'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos del Expediente */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Expediente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Número Caso MP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número Caso MP
                  </label>
                  <input
                    type="text"
                    name="numeroCasoMp"
                    value={formData.numeroCasoMp}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: MP-2024-001"
                  />
                </div>

                {/* Técnico Asignado - Solo visible para roles que no sean TECNICO */}
                {userRole !== 'TECNICO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Técnico Asignado
                    </label>
                    <select
                      name="idTecnicoAsignado"
                      value={formData.idTecnicoAsignado}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Seleccione un técnico</option>
                      {tecnicos.map((t) => (
                        <option key={t.id_usuario} value={t.id_usuario}>
                          {t.nombre} {t.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Fiscalía */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiscalía
                  </label>
                  <select
                    name="idFiscalia"
                    value={formData.idFiscalia}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccione una fiscalía</option>
                    {fiscalias.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad
                  </label>
                  <select
                    name="idUnidad"
                    value={formData.idUnidad}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccione una unidad</option>
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado - Solo visible para roles que no sean TECNICO */}
                {userRole !== 'TECNICO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="idEstado"
                      value={formData.idEstado}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Seleccione un estado</option>
                      {estados.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Urgencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgencia
                  </label>
                  <select
                    name="urgencia"
                    value={formData.urgencia}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="ordinario">Ordinario</option>
                    <option value="urgente">Urgente</option>
                    <option value="muy_urgente">Muy Urgente</option>
                  </select>
                </div>

                {/* Departamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <select
                    name="idDepartamento"
                    value={formData.idDepartamento}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Municipio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Municipio
                  </label>
                  <select
                    name="idMunicipio"
                    value={formData.idMunicipio}
                    onChange={handleChange}
                    disabled={!formData.idDepartamento}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.idDepartamento ? 'Seleccione un municipio' : 'Primero seleccione un departamento'}
                    </option>
                    {municipios.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Delito */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Delito
                  </label>
                  <input
                    type="text"
                    name="tipoDelito"
                    value={formData.tipoDelito}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: Robo, Homicidio, Fraude..."
                  />
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                {/* Documentos del Expediente */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documentos del Expediente
                  </label>
                  {isEditMode ? (
                    <DocumentosUploader
                      idExpediente={parseInt(id!)}
                      readOnly={false}
                    />
                  ) : (
                    <PendingDocumentsUploader
                      files={archivosExpediente}
                      onFilesChange={setArchivosExpediente}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Indicios */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Indicios ({indicios.length})
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddIndicio}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PlusOutlined />
                    Agregar Indicio
                  </button>
                </div>

                {indicios.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay indicios agregados. Haz clic en "Agregar Indicio" para comenzar.
                  </p>
                ) : (
                <div className="space-y-6">
                  {indicios.map((indicio, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Indicio #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveIndicio(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Descripción */}
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción *
                          </label>
                          <input
                            type="text"
                            value={indicio.descripcion}
                            onChange={(e) => handleIndicioChange(index, 'descripcion', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Descripción del indicio..."
                            required
                          />
                        </div>

                        {/* Tipo Objeto */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Objeto
                          </label>
                          <input
                            type="text"
                            value={indicio.tipoObjeto}
                            onChange={(e) => handleIndicioChange(index, 'tipoObjeto', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ej: Casquillo, Documento..."
                          />
                        </div>

                        {/* Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                          </label>
                          <input
                            type="text"
                            value={indicio.color}
                            onChange={(e) => handleIndicioChange(index, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ej: Dorado, Negro..."
                          />
                        </div>

                        {/* Tamaño */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tamaño
                          </label>
                          <input
                            type="text"
                            value={indicio.tamanio}
                            onChange={(e) => handleIndicioChange(index, 'tamanio', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ej: 10cm x 5cm..."
                          />
                        </div>

                        {/* Peso */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Peso
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={indicio.peso}
                            onChange={(e) => handleIndicioChange(index, 'peso', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Unidad de Peso */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unidad de Peso
                          </label>
                          <select
                            value={indicio.pesoUnidad}
                            onChange={(e) => handleIndicioChange(index, 'pesoUnidad', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="gramos">Gramos</option>
                            <option value="kilogramos">Kilogramos</option>
                            <option value="miligramos">Miligramos</option>
                            <option value="libras">Libras</option>
                          </select>
                        </div>

                        {/* Cantidad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={indicio.cantidad}
                            onChange={(e) => handleIndicioChange(index, 'cantidad', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        {/* Ubicación de Hallazgo */}
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ubicación de Hallazgo
                          </label>
                          <input
                            type="text"
                            value={indicio.ubicacionHallazgo}
                            onChange={(e) => handleIndicioChange(index, 'ubicacionHallazgo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Descripción de dónde se encontró el indicio..."
                          />
                        </div>

                        {/* Observaciones del Indicio */}
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observaciones
                          </label>
                          <textarea
                            value={indicio.observaciones}
                            onChange={(e) => handleIndicioChange(index, 'observaciones', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Observaciones del indicio..."
                          />
                        </div>

                        {/* Documentos del Indicio */}
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fotografías / Documentos del Indicio
                          </label>
                          {isEditMode && indicio.id_indicio ? (
                            <DocumentosUploader
                              idExpediente={parseInt(id!)}
                              idIndicio={indicio.id_indicio}
                              readOnly={false}
                            />
                          ) : (
                            <PendingDocumentsUploader
                              files={indicio.archivos}
                              onFilesChange={(files) => handleIndicioFilesChange(index, files)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(isEditMode ? `/expedientes/${id}` : '/expedientes')}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? <LoadingOutlined /> : <SaveOutlined />}
                {isEditMode ? 'Actualizar Expediente' : 'Guardar Expediente'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
