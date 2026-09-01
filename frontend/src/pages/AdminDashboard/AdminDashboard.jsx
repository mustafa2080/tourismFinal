import { Outlet } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminProvider } from './context/AdminContext';

export function AdminDashboard() {
  return (
    <AdminProvider>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminProvider>
  );
}

export default AdminDashboard;
