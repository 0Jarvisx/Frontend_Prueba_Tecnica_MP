import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import {
  TeamOutlined,
  SafetyOutlined,
  FileTextOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import UsersSettings from './tabs/UsersSettings';
import RolesSettings from './tabs/RolesSettings';
import AuditLogSettings from './tabs/AuditLogSettings';
import AsignacionesSettings from './tabs/AsignacionesSettings';

type TabKey = 'users' | 'roles' | 'asignaciones' | 'audit';

const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabKey>('users');

  // Obtener el rol del usuario (puede ser string directo o objeto)
  const userRole = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombreRol || 'Usuario';

  const tabs = [
    {
      key: 'users' as TabKey,
      label: 'Usuarios',
      icon: TeamOutlined,
      component: UsersSettings,
    },
    {
      key: 'roles' as TabKey,
      label: 'Roles y Permisos',
      icon: SafetyOutlined,
      component: RolesSettings,
    },
    {
      key: 'asignaciones' as TabKey,
      label: 'Asignaciones',
      icon: UserSwitchOutlined,
      component: AsignacionesSettings,
    },
    {
      key: 'audit' as TabKey,
      label: 'Bitácora',
      icon: FileTextOutlined,
      component: AuditLogSettings,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.key === activeTab)?.component;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        userName={`${user?.nombre} ${user?.apellido}`}
        userRole={userRole}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
              <p className="text-gray-600">Administra usuarios, roles, permisos y bitácora del sistema</p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${
                        isActive
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="text-lg" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 lg:p-8">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>
    </div>
  );
};

export default Settings;
