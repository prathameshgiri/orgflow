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
  Server, BarChart3, Database, Workflow, Bot, Scale, Book, Zap,
  Megaphone
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
      { label: "Org Updates", icon: Megaphone, path: "/dashboard/updates" },
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
    <aside className={`w-56 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-10 ${isMobile ? 'flex' : 'hidden md:flex'}`}>
      {/* Brand */}
      <div className="p-3 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-start gap-2">
        {activeOrg?.logo_url ? (
          <img src={activeOrg.logo_url} alt="Logo" className="flex h-6 w-6 items-center justify-center rounded-lg object-cover bg-white" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-coral text-white">
              <Command size={12} />
          </div>
        )}
        <div className="font-display font-bold text-base tracking-tight text-ink dark:text-white truncate">
          {activeOrg ? activeOrg.name : "ORG MAN"}
        </div>
      </div>
      
      {/* Workspace Switcher */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-900 relative z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-8 px-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] rounded-lg border-zinc-200 dark:border-zinc-800 hover:shadow-[0_4px_8px_rgba(0,0,0,0.04)] hover:-translate-y-[1px] transition-all bg-gradient-to-b from-white to-zinc-50/80 dark:from-zinc-900 dark:to-zinc-950">
              <span className="truncate text-xs font-semibold">{activeOrg ? activeOrg.name : "Select Workspace"}</span>
              <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0" />
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
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar relative z-10">
        {menuSections.map((section) => (
          <div key={section.title}>
            <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-3">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.links.map(({ label, icon: Icon, path }) => {
                const isActive = location.pathname === path;
                return (
                  <Link 
                    key={path} 
                    to={path} 
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-sm font-medium relative ${
                      isActive 
                        ? "active-nav-item text-[#00e5ff] font-bold" 
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-[#141414] dark:hover:shadow-[4px_4px_10px_rgba(0,0,0,0.6),-4px_-4px_10px_rgba(255,255,255,0.03)] hover:-translate-y-[1px]"
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#00e5ff]" : ""} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-zinc-50/50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-950/50 relative z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 h-10 px-2 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-[1px] transition-all rounded-xl border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/50">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-coral to-orange-500 shadow-inner text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {user?.user_metadata?.full_name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 text-left truncate">
                <div className="text-xs font-semibold truncate leading-tight">
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider truncate leading-tight mt-0.5">
                  {activeOrg ? activeOrg.name : "ORG MAN"}
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
