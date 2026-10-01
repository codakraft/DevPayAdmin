import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RequirePermissionProps {
  // The user needs at least one of these permissions
  permission?: string | string[];
  // ...or at least one of these roles (for endpoints not yet migrated to permissions)
  roles?: string[];
  children?: React.ReactNode;
}

export const NoAccess: React.FC = () => (
  <div style={{ padding: "60px 20px", textAlign: "center" }}>
    <h2 style={{ marginBottom: 8 }}>You don't have access to this page</h2>
    <p style={{ color: "#6B7280", marginBottom: 20 }}>
      Ask your administrator if you think you should.
    </p>
    <Link to="/dashboard" style={{ color: "#3A7145", fontWeight: 500 }}>
      Go to dashboard
    </Link>
  </div>
);

// UI-only gate: the API enforces the same rules regardless
const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  roles,
  children,
}) => {
  const { can, hasRole } = useAuth();
  const permissions =
    permission === undefined
      ? []
      : Array.isArray(permission)
      ? permission
      : [permission];

  const allowed =
    (permissions.length > 0 && permissions.some(can)) ||
    (!!roles && hasRole(...roles));

  if (!allowed) return <NoAccess />;
  return <>{children ?? <Outlet />}</>;
};

export default RequirePermission;
