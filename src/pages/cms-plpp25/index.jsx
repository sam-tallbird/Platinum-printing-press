import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout'; // Import AdminLayout
import withAdminAuth from '../../components/auth/withAdminAuth'; // Import HOC
// We might need layout components or context later

const CmsDashboard = () => {
  return (
    // Wrap content with AdminLayout
    <AdminLayout>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard Overview</h1>
        <p>Welcome to the CMS!</p>
        {/* Add dashboard specific widgets/content */}
      </div>
    </AdminLayout>
  );
};

// Wrap the component with the HOC before exporting
export default withAdminAuth(CmsDashboard);

// Add basic layout or wrapper if needed, for now export directly
// We might want to add an AdminLayout component later to handle sidebar/auth checks 