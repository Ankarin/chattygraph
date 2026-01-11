import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { OrgSync } from "@/components/providers/org-sync";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen max-h-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex h-full flex-col overflow-hidden">
        <Header />
        <OrgSync />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}