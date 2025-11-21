import { useState, useEffect } from 'react';
import { axiosInstance } from '../../../config/axios.config';
import { UserAddOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';

interface Supervisor {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface Tecnico {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface Asignacion {
  id_asignacion: number;
  id_supervisor: number;
  supervisor_nombre: string;
  supervisor_apellido: string;
  id_tecnico: number;
  tecnico_nombre: string;
  tecnico_apellido: string;
  fecha_asignacion: string;
}

const AsignacionesSettings = () => {
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supRes, tecRes, asigRes] = await Promise.all([
        axiosInstance.get('/asignaciones/supervisores'),
        axiosInstance.get('/asignaciones/tecnicos-disponibles'),
        axiosInstance.get('/asignaciones'),
      ]);
      if (supRes.data.success) setSupervisores(supRes.data.data || []);
      if (tecRes.data.success) setTecnicos(tecRes.data.data || []);
      if (asigRes.data.success) setAsignaciones(asigRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupervisor || !selectedTecnico) {
      setMessage({ type: 'error', text: 'Seleccione supervisor y técnico' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/asignaciones', {
        idSupervisor: parseInt(selectedSupervisor),
        idTecnico: parseInt(selectedTecnico),
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setSelectedSupervisor('');
        setSelectedTecnico('');
        fetchData();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al asignar' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta asignación?')) return;

    try {
      const response = await axiosInstance.delete(`/asignaciones/${id}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        fetchData();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Mensaje */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Formulario de asignación */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserAddOutlined />
          Nueva Asignación
        </h3>
        <form onSubmit={handleAsignar} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccione supervisor</option>
              {supervisores.map((s) => (
                <option key={s.id_usuario} value={s.id_usuario}>
                  {s.nombre} {s.apellido}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico (sin asignar)</label>
            <select
              value={selectedTecnico}
              onChange={(e) => setSelectedTecnico(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccione técnico</option>
              {tecnicos.map((t) => (
                <option key={t.id_usuario} value={t.id_usuario}>
                  {t.nombre} {t.apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de asignaciones */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TeamOutlined />
          Asignaciones Actuales
        </h3>
        {asignaciones.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay asignaciones registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {asignaciones.map((a) => (
                  <tr key={a.id_asignacion}>
                    <td className="px-4 py-3 text-sm">{a.supervisor_nombre} {a.supervisor_apellido}</td>
                    <td className="px-4 py-3 text-sm">{a.tecnico_nombre} {a.tecnico_apellido}</td>
                    <td className="px-4 py-3 text-sm">{new Date(a.fecha_asignacion).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEliminar(a.id_asignacion)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <DeleteOutlined />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignacionesSettings;
