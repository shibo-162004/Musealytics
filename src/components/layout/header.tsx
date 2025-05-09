"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

export function Header() {
  const pathname = usePathname();
  const currentNavItem = NAV_ITEMS.find(item => item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href)));
  const pageTitle = currentNavItem ? currentNavItem.title : "Musealytics";

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-background/80 backdrop-blur-sm border-b">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="ml-2 text-xl font-semibold md:ml-0 text-foreground">
        {pageTitle}
      </h1>
      {/* Future additions: Theme toggle, User avatar/menu */}
    </header>
  );
}
