import { usePermission } from "@/hooks/PermissionContext";

const Sidebar = () => {
  const { hasPermission,permissions } = usePermission();

  console.log(permissions);
  
  return (
    <aside>
      <ul>
        {hasPermission("dashboard") && <li>Dashboard</li>}
        {hasPermission("order") && <li>Orders</li>}
        {hasPermission("pickup") && <li>Manage Orders</li>}
        {hasPermission("setting") && <li>User Management</li>}
      </ul>
    </aside>
  );
};

export default Sidebar;
