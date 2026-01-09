"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export default function SidebarManager() {
  const pathname = usePathname();
  const hideSidebar = [
    "/user",
    "/user/create-page",
    "/user/register-institute",
    "/user/register-business",
  ].includes(pathname);
  if (hideSidebar) return null;
  return <Sidebar />;
}
