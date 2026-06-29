import { UserRole } from "@/lib/auth-utills";

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  description?: string;
  roles: UserRole[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

