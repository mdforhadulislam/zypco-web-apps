import { usePermission } from "@/hooks/PermissionContext";

const Sidebar = () => {
  const { hasPermission } = usePermission();

  return (
    <aside>
      <ul>
        {hasPermission("dashboard_view") && <li>Dashboard</li>}
        {hasPermission("orders_view") && <li>Orders</li>}
        {hasPermission("orders_manage") && <li>Manage Orders</li>}
        {hasPermission("users_manage") && <li>User Management</li>}
      </ul>
    </aside>
  );
};

export default Sidebar;
