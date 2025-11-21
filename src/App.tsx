import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProtectedRouteWithPermission } from './components/auth/ProtectedRouteWithPermission';
import { PublicRoute } from './components/auth/PublicRoute';
import { Dashboard } from './pages/dashboard/Dashboard';
import Login from './pages/auth/Login';
import RequestReset from './pages/auth/RequestReset';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import Forbidden from './pages/errors/Forbidden';
import Unauthorized from './pages/errors/Unauthorized';
import { ExpedientesList } from './pages/expedientes/ExpedientesList';
import { ExpedienteDetail } from './pages/expedientes/ExpedienteDetail';
import { ExpedienteForm } from './pages/expedientes/ExpedienteForm';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/request-reset"
          element={
            <PublicRoute>
              <RequestReset />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRouteWithPermission permissionId={11}>
              <Settings />
            </ProtectedRouteWithPermission>
          }
        />
        <Route
          path="/expedientes"
          element={
            <ProtectedRoute>
              <ExpedientesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expedientes/nuevo"
          element={
            <ProtectedRouteWithPermission permissionId={1}>
              <ExpedienteForm />
            </ProtectedRouteWithPermission>
          }
        />
        <Route
          path="/expedientes/:id"
          element={
            <ProtectedRoute>
              <ExpedienteDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expedientes/:id/editar"
          element={
            <ProtectedRouteWithPermission permissionId={3}>
              <ExpedienteForm />
            </ProtectedRouteWithPermission>
          }
        />
        <Route path="/error/unauthorized" element={<Unauthorized />} />
        <Route path="/error/forbidden" element={<Forbidden />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
