import { ReactNode } from "react";
import { Home, Upload, FileText, Settings, ChevronLeft, FolderOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import troolyLogo from "@/assets/trooly-logo.svg";
import troolyText from "@/assets/trooly-text.svg";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

const AppSidebar = () => {
  const { open, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="transition-all duration-300"
    >
      <SidebarContent className="bg-sidebar border-r border-sidebar-border overflow-y-auto overflow-x-hidden">
        {/* Header with toggle */}
        <div
          className={`p-3 border-b border-sidebar-border flex items-center ${
            open ? "justify-between" : "justify-center"
          }`}
        >
          {open ? (
            <>
              <div className="flex items-center space-x-2">
                <img 
                  src={troolyLogo} 
                  alt="Trooly Logo" 
                  className="h-6 w-auto"
                />
                <img 
                  src={troolyText} 
                  alt="Trooly Text" 
                  className="h-5 w-auto mt-0.5"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-10 w-10 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center w-full cursor-pointer" onClick={toggleSidebar}>
              <img 
                src={troolyLogo} 
                alt="Trooly Logo" 
                className="h-7 w-auto"
              />
            </div>
          )}
        </div>

        {/* Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="p-2 space-y-1 group-data-[collapsible=icon]:px-0">
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton asChild className="bg-sidebar-accent text-sidebar-accent-foreground hover:bg-primary/20 hover:text-primary active:bg-primary/20 active:text-primary transition-colors group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center">
                  <a
                    href="/"
                    className={`flex items-center rounded-md transition-colors w-full h-10
                      ${open ? "justify-start gap-3 px-3" : "justify-center items-center"}
                      hover:bg-accent hover:text-accent-foreground
                    `}
                  >
                    <Home className={`h-5 w-5 flex-shrink-0 ${!open ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} />
                    {open && <span className="font-medium">Dashboard</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton asChild className="hover:bg-primary/20 hover:text-primary active:bg-primary/20 active:text-primary transition-colors group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center">
                  <a
                    href="#"
                    className={`flex items-center rounded-md transition-colors w-full h-10
                      ${open ? "justify-start gap-3 px-3" : "justify-center items-center"}
                      hover:bg-accent hover:text-accent-foreground
                    `}
                  >
                    <Upload className={`h-5 w-5 flex-shrink-0 ${!open ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} />
                    {open && <span className="font-medium">Upload</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton asChild className="hover:bg-primary/20 hover:text-primary active:bg-primary/20 active:text-primary transition-colors group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center">
                  <a
                    href="#"
                    className={`flex items-center rounded-md transition-colors w-full h-10
                      ${open ? "justify-start gap-3 px-3" : "justify-center items-center"}
                      hover:bg-accent hover:text-accent-foreground
                    `}
                  >
                    <FileText className={`h-5 w-5 flex-shrink-0 ${!open ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} />
                    {open && <span className="font-medium">Results</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton asChild className="hover:bg-primary/20 hover:text-primary active:bg-primary/20 active:text-primary transition-colors group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center">
                  <a
                    href="/uploaded-files"
                    className={`flex items-center rounded-md transition-colors w-full h-10
                      ${open ? "justify-start gap-3 px-3" : "justify-center items-center"}
                      hover:bg-accent hover:text-accent-foreground
                    `}
                  >
                    <FolderOpen className={`h-5 w-5 flex-shrink-0 ${!open ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} />
                    {open && <span className="font-medium">Uploaded Files</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton asChild className="hover:bg-primary/20 hover:text-primary active:bg-primary/20 active:text-primary transition-colors group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center">
                  <a
                    href="#"
                    className={`flex items-center rounded-md transition-colors w-full h-10
                      ${open ? "justify-start gap-3 px-3" : "justify-center items-center"}
                      hover:bg-accent hover:text-accent-foreground
                    `}
                  >
                    <Settings className={`h-5 w-5 flex-shrink-0 ${!open ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} />
                    {open && <span className="font-medium">Settings</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout section */}
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              onClick={handleLogout}
              className="hover:bg-destructive/20 hover:text-destructive transition-colors group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
            >
              <div
                className={`flex items-center rounded-md transition-colors w-full h-10
                  ${open ? "justify-start gap-3 px-3" : "justify-center items-center"}
                `}
              >
                <LogOut className={`h-5 w-5 flex-shrink-0 ${!open ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} />
                {open && <span className="font-medium">Logout</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
