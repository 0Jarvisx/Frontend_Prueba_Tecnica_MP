import { useState, useEffect } from 'react';
import { axiosInstance } from '../../config/axios.config';
import {
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LoadingOutlined,
  EyeOutlined,
  CloseOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from '@ant-design/icons';

interface Documento {
  id_documento: number;
  nombre_archivo: string;
  tipo_documento: string;
  extension: string;
  tamanio_kb: number;
  fecha_carga: string;
  usuario_nombre: string;
  usuario_apellido: string;
  descripcion?: string;
}

interface DocumentosUploaderProps {
  idExpediente: number;
  idIndicio?: number;
  readOnly?: boolean;
}

// Para archivos pendientes durante creación
export interface PendingFile {
  file: File;
  tipoDocumento: string;
  descripcion: string;
  preview?: string;
}

interface PendingUploaderProps {
  files: PendingFile[];
  onFilesChange: (files: PendingFile[]) => void;
}

const TIPOS_DOCUMENTO = [
  { value: 'dictamen', label: 'Dictamen' },
  { value: 'foto', label: 'Fotografía' },
  { value: 'oficio', label: 'Oficio' },
  { value: 'informe', label: 'Informe' },
  { value: 'otro', label: 'Otro' },
];

const isImage = (ext: string) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext.toLowerCase());
const isPdf = (ext: string) => ext.toLowerCase() === 'pdf';

// Componente para visualizar archivos en modal
const FileViewer = ({ url, type, onClose }: { url: string; type: 'image' | 'pdf'; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-xl">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
      >
        <CloseOutlined className="text-xl" />
      </button>
      {type === 'image' ? (
        <img src={url} alt="Vista previa" className="w-full h-full object-contain max-h-[85vh]" />
      ) : (
        <iframe src={url} className="w-full h-[85vh]" title="PDF Viewer" />
      )}
    </div>
  </div>
);

// Componente para subir archivos pendientes (durante creación)
export const PendingDocumentsUploader = ({ files, onFilesChange }: PendingUploaderProps) => {
  const [tipoDocumento, setTipoDocumento] = useState('foto');
  const [descripcion, setDescripcion] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: PendingFile[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      newFiles.push({
        file,
        tipoDocumento,
        descripcion,
        preview: isImage(ext) ? URL.createObjectURL(file) : undefined,
      });
    }

    onFilesChange([...files, ...newFiles]);
    setDescripcion('');
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              placeholder="Opcional"
            />
          </div>
          <label className="cursor-pointer px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center gap-1 text-sm">
            <UploadOutlined />
            Agregar
            <input type="file" className="hidden" onChange={handleFileSelect} multiple accept="image/*,.pdf" />
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {files.map((f, idx) => (
            <div key={idx} className="relative border rounded-lg overflow-hidden bg-gray-100">
              {f.preview ? (
                <img src={f.preview} alt="" className="w-full h-24 object-cover" />
              ) : (
                <div className="w-full h-24 flex items-center justify-center">
                  <FilePdfOutlined className="text-3xl text-red-500" />
                </div>
              )}
              <div className="absolute top-1 right-1">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <CloseOutlined className="text-xs" />
                </button>
              </div>
              <div className="p-1 text-xs truncate bg-white">{f.file.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente principal para documentos guardados
export const DocumentosUploader = ({ idExpediente, idIndicio, readOnly = false }: DocumentosUploaderProps) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('otro');
  const [descripcion, setDescripcion] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewingFile, setViewingFile] = useState<{ url: string; type: 'image' | 'pdf' } | null>(null);

  const fetchDocumentos = async () => {
    setLoading(true);
    try {
      const endpoint = idIndicio
        ? `/documentos/indicio/${idIndicio}`
        : `/documentos/expediente/${idExpediente}`;
      const response = await axiosInstance.get(endpoint);
      if (response.data.success) {
        setDocumentos(response.data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, [idExpediente, idIndicio]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('idExpediente', idExpediente.toString());
    if (idIndicio) formData.append('idIndicio', idIndicio.toString());
    formData.append('tipoDocumento', tipoDocumento);
    if (descripcion) formData.append('descripcion', descripcion);

    try {
      const response = await axiosInstance.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Archivo subido correctamente' });
        setDescripcion('');
        fetchDocumentos();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al subir archivo' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este documento?')) return;

    try {
      const response = await axiosInstance.delete(`/documentos/${id}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Documento eliminado' });
        fetchDocumentos();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar' });
    }
  };

  const handleDownload = async (id: number, nombreArchivo: string) => {
    try {
      const response = await axiosInstance.get(`/documentos/${id}/descargar`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al descargar archivo' });
    }
  };

  const handleView = async (id: number, extension: string) => {
    try {
      const response = await axiosInstance.get(`/documentos/${id}/descargar`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: isImage(extension) ? `image/${extension}` : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      setViewingFile({ url, type: isImage(extension) ? 'image' : 'pdf' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al visualizar archivo' });
    }
  };

  const formatSize = (kb: number) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  const getFileIcon = (ext: string) => {
    if (isImage(ext)) return <FileImageOutlined className="text-xl text-blue-500" />;
    if (isPdf(ext)) return <FilePdfOutlined className="text-xl text-red-500" />;
    return <FileOutlined className="text-xl text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {viewingFile && (
        <FileViewer
          url={viewingFile.url}
          type={viewingFile.type}
          onClose={() => {
            URL.revokeObjectURL(viewingFile.url);
            setViewingFile(null);
          }}
        />
      )}

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {!readOnly && (
        <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción (opcional)</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Descripción del documento"
              />
            </div>
            <label className="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm">
              {uploading ? <LoadingOutlined spin /> : <UploadOutlined />}
              {uploading ? 'Subiendo...' : 'Subir archivo'}
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-gray-500">Cargando documentos...</div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No hay documentos</div>
      ) : (
        <div className="space-y-2">
          {documentos.map((doc) => (
            <div
              key={doc.id_documento}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(doc.extension)}
                <div>
                  <p className="font-medium text-sm">{doc.nombre_archivo}</p>
                  <p className="text-xs text-gray-500">
                    {doc.tipo_documento} · {formatSize(doc.tamanio_kb)} · {doc.usuario_nombre} {doc.usuario_apellido}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {(isImage(doc.extension) || isPdf(doc.extension)) && (
                  <button
                    onClick={() => handleView(doc.id_documento, doc.extension)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                    title="Ver"
                  >
                    <EyeOutlined />
                  </button>
                )}
                <button
                  onClick={() => handleDownload(doc.id_documento, doc.nombre_archivo)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Descargar"
                >
                  <DownloadOutlined />
                </button>
                {!readOnly && (
                  <button
                    onClick={() => handleDelete(doc.id_documento)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <DeleteOutlined />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
