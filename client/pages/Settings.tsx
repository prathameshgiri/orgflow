import React, { useEffect, useState } from "react";
import { Save, Shield, Bell, Building, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../shared/supabase";

export default function Settings() {
  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // States
  const [orgName, setOrgName] = useState("");
  const [domain, setDomain] = useState("");
  
  // Settings JSON states
  const [timezone, setTimezone] = useState("UTC (Coordinated Universal Time)");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(120);
  
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [approvalReminders, setApprovalReminders] = useState(true);
  const [slaWarnings, setSlaWarnings] = useState(true);
  
  const [p1Sla, setP1Sla] = useState("4 Hours");
  const [p2Sla, setP2Sla] = useState("8 Hours");
  const [p3Sla, setP3Sla] = useState("24 Hours");
  const [p4Sla, setP4Sla] = useState("48 Hours");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadOrg() {
      if (!orgId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("organizations")
        .select("name, domain, settings")
        .eq("id", orgId)
        .single();
        
      if (data) {
        setOrgName(data.name || "");
        setDomain(data.domain || "");
        
        const settings = data.settings || {};
        if (settings.timezone) setTimezone(settings.timezone);
        if (settings.mfaEnabled !== undefined) setMfaEnabled(settings.mfaEnabled);
        if (settings.ssoEnabled !== undefined) setSsoEnabled(settings.ssoEnabled);
        if (settings.sessionTimeout !== undefined) setSessionTimeout(settings.sessionTimeout);
        if (settings.incidentAlerts !== undefined) setIncidentAlerts(settings.incidentAlerts);
        if (settings.approvalReminders !== undefined) setApprovalReminders(settings.approvalReminders);
        if (settings.slaWarnings !== undefined) setSlaWarnings(settings.slaWarnings);
        if (settings.p1Sla) setP1Sla(settings.p1Sla);
        if (settings.p2Sla) setP2Sla(settings.p2Sla);
        if (settings.p3Sla) setP3Sla(settings.p3Sla);
        if (settings.p4Sla) setP4Sla(settings.p4Sla);
      }
      setLoading(false);
    }
    loadOrg();
  }, [orgId]);

  const handleSave = async () => {
    setSaving(true);
    
    const settingsJson = {
      timezone,
      mfaEnabled,
      ssoEnabled,
      sessionTimeout,
      incidentAlerts,
      approvalReminders,
      slaWarnings,
      p1Sla,
      p2Sla,
      p3Sla,
      p4Sla
    };

    if (!orgId) {
      if (!user) {
        toast({ title: "Error", description: "Not authenticated.", variant: "destructive" });
        setSaving(false);
        return;
      }
      
      const newOrgId = crypto.randomUUID();
      
      const { error: createError } = await supabase
        .from("organizations")
        .insert({ 
          id: newOrgId,
          name: orgName || "My Workspace",
          domain: domain,
          settings: settingsJson
        });
        
      if (createError) {
        toast({ title: "Failed to create organization", description: createError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      
      const { error: updateUserError } = await supabase.from("users").update({ organization_id: newOrgId }).eq("id", user.id);
      
      if (updateUserError) {
        console.error("Failed to update user with new org ID:", updateUserError);
        toast({ title: "Failed to link organization to your user profile", description: updateUserError.message, variant: "destructive" });
      }
      
      toast({ 
        title: "Workspace Created", 
        description: "Your organization has been created and settings saved.",
        variant: "default" 
      });
      
      window.location.reload();
      return;
    }

    const { error } = await supabase
      .from("organizations")
      .update({ 
        name: orgName,
        domain: domain,
        settings: settingsJson
      })
      .eq("id", orgId);
      
    setSaving(false);
    
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "Settings Saved", 
        description: "Organization settings have been successfully updated.",
        variant: "default" 
      });
      // Force reload to update sidebar and global layout state
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-zinc-500">Manage your workspace preferences and configurations.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 w-full justify-start border-b border-zinc-200 dark:border-zinc-800 rounded-none bg-transparent p-0 h-auto overflow-x-auto">
          <TabsTrigger value="general" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-3 data-[state=active]:bg-transparent">
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-3 data-[state=active]:bg-transparent">
            Security & Auth
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-3 data-[state=active]:bg-transparent">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="sla" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-3 data-[state=active]:bg-transparent">
            SLA Policies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Building className="h-5 w-5 text-indigo-600" /> Workspace Details</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="grid gap-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input 
                  id="orgName" 
                  value={orgName} 
                  onChange={(e) => setOrgName(e.target.value)} 
                  placeholder="Enter organization name" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Primary Domain</Label>
                <Input 
                  id="domain" 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)} 
                  placeholder="e.g. yourcompany.com" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <select 
                  id="timezone" 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                  <option>IST (Indian Standard Time)</option>
                </select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-indigo-600" /> Access Security</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Require Multi-Factor Authentication</h4>
                  <p className="text-sm text-zinc-500">Force all users to set up MFA.</p>
                </div>
                <Switch 
                  checked={mfaEnabled} 
                  onCheckedChange={setMfaEnabled} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Single Sign-On (SSO)</h4>
                  <p className="text-sm text-zinc-500">Allow login via SAML/OAuth providers.</p>
                </div>
                <Switch 
                  checked={ssoEnabled} 
                  onCheckedChange={setSsoEnabled} 
                />
              </div>
              <div className="grid gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                <Input 
                  id="sessionTimeout" 
                  type="number" 
                  value={sessionTimeout} 
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-indigo-600" /> Global Notifications</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Incident Alerts</h4>
                  <p className="text-sm text-zinc-500">Email admins on new P1/P2 incidents.</p>
                </div>
                <Switch 
                  checked={incidentAlerts} 
                  onCheckedChange={setIncidentAlerts} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Approval Reminders</h4>
                  <p className="text-sm text-zinc-500">Send daily reminders for pending approvals.</p>
                </div>
                <Switch 
                  checked={approvalReminders} 
                  onCheckedChange={setApprovalReminders} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SLA Breach Warnings</h4>
                  <p className="text-sm text-zinc-500">Notify assignees before an SLA breaches.</p>
                </div>
                <Switch 
                  checked={slaWarnings} 
                  onCheckedChange={setSlaWarnings} 
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sla" className="space-y-6">
           <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-indigo-600" /> Resolution SLAs</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>P1 (Critical) Resolution Time</Label>
                  <Input 
                    type="text" 
                    value={p1Sla} 
                    onChange={(e) => setP1Sla(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>P2 (High) Resolution Time</Label>
                  <Input 
                    type="text" 
                    value={p2Sla} 
                    onChange={(e) => setP2Sla(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>P3 (Medium) Resolution Time</Label>
                  <Input 
                    type="text" 
                    value={p3Sla} 
                    onChange={(e) => setP3Sla(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>P4 (Low) Resolution Time</Label>
                  <Input 
                    type="text" 
                    value={p4Sla} 
                    onChange={(e) => setP4Sla(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
