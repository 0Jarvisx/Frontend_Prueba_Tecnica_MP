import { useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/auth.store';

const Unauthorized = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-4">
            <ExclamationCircleOutlined className="text-5xl text-yellow-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">401</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sesión Expirada</h2>
          <p className="text-gray-600 mb-8">
            Tu sesión ha expirado o no estás autenticado. Por favor, inicia sesión nuevamente para
            continuar.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <LoginOutlined />
            Iniciar Sesión
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Si continúas experimentando problemas, contacta al soporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
