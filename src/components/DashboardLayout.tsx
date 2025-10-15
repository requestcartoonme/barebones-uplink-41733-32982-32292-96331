import { ReactNode } from "react";
import { Home, Upload, FileText, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

const AppSidebar = () => {
  const { open, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" className={open ? "w-64" : "w-16"}>
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <h1 className={`text-xl font-bold text-sidebar-foreground transition-all duration-200 ${open ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Scraper Dashboard
          </h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 flex-shrink-0 hover:bg-sidebar-accent"
          >
            {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="p-2 space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-sidebar-accent text-sidebar-accent-foreground">
                  <a href="/" className={`flex items-center gap-3 px-3 py-3 ${!open && 'justify-center px-0'}`}>
                    <Home className="w-5 h-5 flex-shrink-0" />
                    {open && <span className="font-medium">Dashboard</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className={`flex items-center gap-3 px-3 py-3 ${!open && 'justify-center px-0'}`}>
                    <Upload className="w-5 h-5 flex-shrink-0" />
                    {open && <span className="font-medium">Upload</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className={`flex items-center gap-3 px-3 py-3 ${!open && 'justify-center px-0'}`}>
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    {open && <span className="font-medium">Results</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className={`flex items-center gap-3 px-3 py-3 ${!open && 'justify-center px-0'}`}>
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {open && <span className="font-medium">Settings</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-3 border-t border-sidebar-border">
          <div className={`px-3 py-2.5 rounded-lg bg-sidebar-accent/50 ${!open && 'flex justify-center px-0'}`}>
            {open && <p className="text-xs text-sidebar-foreground/70 mb-1">Status</p>}
            <div className={`flex items-center gap-2 ${open ? '' : 'justify-center'}`}>
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
              {open && <span className="text-sm font-medium text-sidebar-foreground">Connected</span>}
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex w-full bg-background overflow-hidden">
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
