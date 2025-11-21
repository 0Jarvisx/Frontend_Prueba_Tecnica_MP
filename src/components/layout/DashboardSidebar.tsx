import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

interface DashboardSidebarProps {
  userName: string;
  userRole: string;
}

export const DashboardSidebar = ({ userName, userRole }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermissionById } = usePermissions();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: DashboardOutlined,
      path: '/dashboard',
      show: true,
    },
    {
      title: 'Expedientes',
      icon: FileTextOutlined,
      path: '/expedientes',
      show: hasPermissionById(2), // ver expedientes
    },
    {
      title: 'Configuración',
      icon: SettingOutlined,
      path: '/settings',
      show: hasPermissionById(11), // gestionar_sistema
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-lg lg:hidden top-4 left-4"
      >
        {isOpen ? (
          <CloseOutlined className="text-xl text-gray-700" />
        ) : (
          <MenuOutlined className="text-xl text-gray-700" />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden backdrop-blur-sm bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10">
                <img
                  src="/Logo_MP.png"
                  alt="Logo MP"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sistema DICRI</h2>
                <p className="text-xs text-gray-500">Gestión Forense</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <button
            onClick={() => {
              navigate('/profile');
              setIsOpen(false);
            }}
            className="w-full p-6 text-left transition-colors border-b border-gray-200 bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                <UserOutlined className="text-xl text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userRole}</p>
              </div>
            </div>
          </button>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              if (!item.show) return null;

              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 text-left
                    ${
                      active
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`text-lg ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-4 py-3 text-left text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
            >
              <LogoutOutlined className="text-lg" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
