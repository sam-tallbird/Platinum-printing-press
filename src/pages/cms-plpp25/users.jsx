import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import withAdminAuth from '../../components/auth/withAdminAuth';

const CmsUsers = () => {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Users</h1>
        {/* Users content goes here */}
        <p>User management interface...</p>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(CmsUsers); 