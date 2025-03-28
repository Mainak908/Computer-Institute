"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store";

export default function Layout({ dashboard }: { dashboard: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen } = useAuthStore();

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
      <SidebarTrigger className="absolute rounded-none z-50" />
      <div className="h-screen flex flex-col bg-gray-100 w-screen">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AppSidebar />
          {/* Main Content */}
          <main className="flex-col gap-4 lg:p-6 overflow-y-auto w-screen">
            {dashboard}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
