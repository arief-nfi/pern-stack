import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute requiredPermission={{ resource: 'users', action: 'read' }}>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/roles" element={
            <ProtectedRoute requiredPermission={{ resource: 'roles', action: 'read' }}>
              <Layout>
                <Roles />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/permissions" element={
            <ProtectedRoute requiredPermission={{ resource: 'permissions', action: 'read' }}>
              <Layout>
                <Permissions />
              </Layout>
            </ProtectedRoute>
          } />          
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
