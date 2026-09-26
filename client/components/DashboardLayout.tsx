import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";
import { supabase } from "../../shared/supabase";
import AppSidebar from "./AppSidebar";
import { Search, Bell, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const DashboardLayout = () => {
  const { user, session } = useAuth();
  const { activeOrganizationId, setActiveOrganizationId } = useOrgStore();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processPendingInvite = async () => {
      const pendingToken = localStorage.getItem("pending_invite_token");
      if (pendingToken) {
        try {
          const { error } = await supabase.rpc('accept_invitation', { 
            p_invite_token: pendingToken 
          });
          if (!error) {
            localStorage.removeItem("pending_invite_token");
          }
        } catch (e) {
          console.error("Failed to process invite", e);
        }
      }
    };

    const fetchOrgs = async () => {
      if (!user) return;
      await processPendingInvite();
      
      // 1. Fetch user profile from public.users
      const { data: userProfile } = await supabase
        .from("users")
        .select("id, organization_id, full_name, email")
        .eq("id", user.id)
        .maybeSingle();

      let currentOrgId = userProfile?.organization_id;

      // 2. Auto-heal: If user has no organization_id, check user_metadata.org_name
      if (!currentOrgId && user.user_metadata?.org_name) {
        const metadataOrgName = user.user_metadata.org_name;
        const metadataFullName = user.user_metadata.full_name || "Admin";

        let orgToUse: any = null;
        const { data: existingOrg } = await supabase
          .from("organizations")
          .select("id, name")
          .eq("name", metadataOrgName)
          .maybeSingle();

        if (existingOrg) {
          orgToUse = existingOrg;
        } else {
          const { data: newOrg } = await supabase
            .from("organizations")
            .insert({
              name: metadataOrgName,
              email: user.email,
              admin_name: metadataFullName,
            })
            .select("id, name")
            .single();
          if (newOrg) {
            orgToUse = newOrg;
          }
        }

        if (orgToUse) {
          currentOrgId = orgToUse.id;
          await supabase
            .from("users")
            .upsert({
              id: user.id,
              organization_id: orgToUse.id,
              full_name: metadataFullName,
              email: user.email || "",
            });
        }
      }

      // 3. Fetch organization: query by currentOrgId or fallback to all user accessible organizations
      let orgsList: any[] = [];
      if (currentOrgId) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("id, name")
          .eq("id", currentOrgId)
          .maybeSingle();
        if (orgData) {
          orgsList = [orgData];
        }
      }

      if (orgsList.length === 0) {
        const { data: allOrgs } = await supabase
          .from("organizations")
          .select("id, name");
        if (allOrgs && allOrgs.length > 0) {
          orgsList = allOrgs;
          if (!currentOrgId) {
            currentOrgId = allOrgs[0].id;
          }
        }
      }

      if (orgsList.length > 0) {
        setOrganizations(orgsList);
        const targetId = currentOrgId || orgsList[0].id;
        setActiveOrganizationId(targetId);
      }
    };
    if (user) fetchOrgs();
  }, [user?.id]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const activeOrg = organizations.find(o => o.id === activeOrganizationId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex font-sans">
      <AppSidebar organizations={organizations} onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-white dark:bg-zinc-900/20">
        
        {/* Enterprise Top Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden h-9 w-9 flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r border-zinc-200 dark:border-zinc-800">
                <AppSidebar organizations={organizations} onSignOut={handleSignOut} isMobile />
              </SheetContent>
            </Sheet>
            <div className="font-semibold text-lg text-ink dark:text-white capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="h-9 w-64 rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none transition focus:border-coral focus:ring-1 focus:ring-coral dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <button className="h-9 w-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-coral"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
