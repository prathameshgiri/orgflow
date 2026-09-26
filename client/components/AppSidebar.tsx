import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard, Users, UsersRound, Building2,
  ShieldCheck, FileText, CheckSquare, MessageSquare, 
  Settings, LogOut, ChevronDown, Command, Activity,
  Briefcase, LifeBuoy, AlertCircle, FilePlus, BookOpen,
  Server, BarChart3, Database, Workflow, Bot, Scale, Book
} from "lucide-react";

interface SidebarProps {
  organizations: any[];
  onSignOut: () => void;
  isMobile?: boolean;
}

const menuSections = [
  {
    title: "Operations",
    links: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Projects", icon: Briefcase, path: "/dashboard/projects" },
      { label: "Tasks", icon: CheckSquare, path: "/dashboard/tasks" },
      { label: "Teams", icon: UsersRound, path: "/dashboard/teams" },
    ]
  },
  {
    title: "Service Management",
    links: [
      { label: "SCTASK", icon: LifeBuoy, path: "/dashboard/service-desk" },
      { label: "Incidents", icon: AlertCircle, path: "/dashboard/incidents" },
      { label: "Requests", icon: FilePlus, path: "/dashboard/requests" },
      { label: "Approvals", icon: CheckSquare, path: "/dashboard/approvals" },
    ]
  },
  {
    title: "Knowledge",
    links: [
      { label: "Knowledge Base", icon: Book, path: "/dashboard/knowledge" },
    ]
  },
  {
    title: "Analytics",
    links: [
      { label: "Reports", icon: BarChart3, path: "/dashboard/reports" },
      { label: "SLA Dashboard", icon: Activity, path: "/dashboard/sla" },
    ]
  },
  {
    title: "Administration",
    links: [
      { label: "Users", icon: Users, path: "/dashboard/users" },
      { label: "Roles & Permissions", icon: ShieldCheck, path: "/dashboard/roles" },
      { label: "Automations", icon: Workflow, path: "/dashboard/workflows" },
      { label: "Settings", icon: Settings, path: "/dashboard/settings" },
    ]
  }
];

export default function AppSidebar({ organizations, onSignOut, isMobile }: SidebarProps) {
  const { user } = useAuth();
  const { activeOrganizationId, setActiveOrganizationId } = useOrgStore();
  const location = useLocation();

  const activeOrg = organizations.find(o => o.id === activeOrganizationId);

  return (
    <aside className={`w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex-col h-screen sticky top-0 ${isMobile ? 'flex' : 'hidden md:flex'}`}>
      {/* Brand */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-start gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-coral text-white">
            <Command size={14} />
        </div>
        <div className="font-display font-bold text-lg tracking-tight text-ink dark:text-white truncate">
          {activeOrg ? activeOrg.name : "ORG FLOW"}
        </div>
      </div>
      
      {/* Workspace Switcher */}
      <div className="p-4 pb-2 border-b border-zinc-100 dark:border-zinc-900">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-9 px-3">
              <span className="truncate text-sm font-semibold">{activeOrg ? activeOrg.name : "Select Workspace"}</span>
              <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Your Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {organizations.map(org => (
              <DropdownMenuItem key={org.id} onClick={() => setActiveOrganizationId(org.id)} className="font-medium">
                {org.name}
              </DropdownMenuItem>
            ))}
            {organizations.length === 0 && (
              <DropdownMenuItem disabled>No workspaces</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title}>
            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-3">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.links.map(({ label, icon: Icon, path }) => {
                const isActive = location.pathname === path;
                return (
                  <Link 
                    key={path} 
                    to={path} 
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors text-[13px] font-medium ${
                      isActive 
                        ? "bg-coral/10 text-coral dark:bg-coral/20" 
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-2 hover:bg-zinc-200 dark:hover:bg-zinc-800">
              <div className="w-7 h-7 rounded-md bg-coral/20 text-coral flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.user_metadata?.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 text-left truncate">
                <div className="text-sm font-semibold truncate leading-tight">
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate leading-tight mt-0.5">
                  {activeOrg ? activeOrg.name : "ORG FLOW"}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-red-500 focus:bg-red-50 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
