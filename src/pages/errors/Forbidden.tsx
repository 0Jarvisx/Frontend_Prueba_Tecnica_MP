import { useNavigate } from 'react-router-dom';
import { LockOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
            <LockOutlined className="text-5xl text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-8">
            No tienes los privilegios necesarios para acceder a este recurso. Si crees que esto es un error,
            contacta al administrador del sistema.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <ArrowLeftOutlined />
            Volver Atrás
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <HomeOutlined />
            Ir al Dashboard
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Si necesitas acceso a esta sección, solicita los permisos necesarios a tu administrador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
