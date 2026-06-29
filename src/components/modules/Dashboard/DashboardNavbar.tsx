import { getUserInfo } from "@/services/auth/getUserInfo";
import DashboardNavbarContent from "./DashboardNavbarContent";
import { UserInfo } from "@/types/user.interface";
import { getDefaultDashboardRoute } from "@/lib/auth-utills";
import { NavSection } from "@/types/dashboard.interfact";
import { getNavItemsByRole } from "@/lib/navItems.config";

const DashboardNavbar = async () => {
  const userInfo = (await getUserInfo()) as UserInfo;
  const navItems: NavSection[] = getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardNavbarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardNavbar;
