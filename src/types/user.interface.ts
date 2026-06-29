import { UserRole } from "@/lib/auth-utills";

export interface UserInfo {
  name: string;
  email: string;
  role: UserRole;
}
