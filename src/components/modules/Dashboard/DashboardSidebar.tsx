import { getUserInfo } from "@/services/auth/getUserInfo";
import { UserInfo } from "@/types/user.interface";
import DashboardSidebarContent from "./DashboardSidebarContent";
import { getDefaultDashboardRoute } from "@/lib/auth-utills";
import { NavSection } from "@/types/dashboard.interfact";
import { getNavItemsByRole } from "@/lib/navItems.config";

const DashboardSidebar = async () => {
  const userInfo = (await getUserInfo()) as UserInfo;
  const navItems : NavSection[] = getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <div>
      <DashboardSidebarContent userInfo={userInfo} navItems={navItems} dashboardHome={dashboardHome} />
    </div>
  );
};

export default DashboardSidebar;
