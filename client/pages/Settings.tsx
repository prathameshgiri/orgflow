import React, { useEffect, useState, useRef } from "react";
import { Save, Shield, Bell, Building, CheckCircle, Upload, CreditCard, Activity, Globe, Lock, History, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../shared/supabase";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

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
  const [activeTab, setActiveTab] = useState("general");
  
  // New States
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadOrg() {
      if (!orgId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("organizations")
        .select("name, domain, settings, logo_url")
        .eq("id", orgId)
        .maybeSingle();
        
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
        if (settings.p4Sla) setP4Sla(settings.p4Sla);
        if ((data as any).logo_url) setLogoUrl((data as any).logo_url);
      }
      
      // Fetch Audit Logs
      const { data: logs, error: logError } = await supabase
        .from('audit_logs')
        .select(`*, users(full_name, email)`)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (logs) setAuditLogs(logs);
      
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
        toast({ title: "Failed to link organization", description: updateUserError.message, variant: "destructive" });
      }
      
      toast({ title: "Workspace Created", description: "Your organization has been created." });
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
      
    if (!error) {
      // Log audit event
      if (user) {
        await supabase.from('audit_logs').insert({
          organization_id: orgId,
          actor_id: user.id,
          action: 'Updated Organization Settings',
          details: settingsJson
        });
      }
    }
      
    setSaving(false);
    
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "Settings Saved", 
        description: "Organization settings have been successfully updated.",
      });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingLogo(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${orgId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('org_logos').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('org_logos').getPublicUrl(filePath);
      
      setLogoUrl(publicUrlData.publicUrl);
      
      await supabase.from('organizations').update({ logo_url: publicUrlData.publicUrl }).eq('id', orgId);
      
      if (user) {
        await supabase.from('audit_logs').insert({
          organization_id: orgId,
          actor_id: user.id,
          action: 'Updated Organization Logo',
          details: { new_logo: publicUrlData.publicUrl }
        });
      }

      toast({ title: "Logo Updated", description: "Your organization logo has been updated successfully." });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Error uploading logo", description: error.message, variant: "destructive" });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Platform Settings
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Manage your organization's core preferences, security, and SLAs.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="group relative h-11 overflow-hidden rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md px-6"
        >
          <span className="relative z-10 flex items-center justify-center">
            <Save className="mr-2 h-5 w-5" /> 
            {saving ? "Saving Changes..." : "Save Configuration"}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        
        {/* Vertical Tabs Sidebar */}
        <div className="space-y-2 flex flex-col">
          {[
            { id: "general", label: "General Workspace", icon: Building },
            { id: "security", label: "Security & Auth", icon: Shield },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "sla", label: "SLA Policies", icon: CheckCircle },
            { id: "audit", label: "Audit Logs", icon: History },
            { id: "billing", label: "Billing & Plans", icon: CreditCard, disabled: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold border ${
                  isActive 
                    ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon size={18} className={isActive ? "text-indigo-600 dark:text-indigo-400" : ""} />
                {tab.label}
                {tab.disabled && <span className="ml-auto text-[10px] uppercase bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Soon</span>}
              </button>
            )
          })}
        </div>

        {/* Tab Content Area */}
        <Card className="p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-950/50">
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium">Loading configuration...</p>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              
              {activeTab === "general" && (
                <div className="space-y-8 max-w-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">General Workspace</h3>
                    <p className="text-sm text-zinc-500">Update your company's basic information and domain.</p>
                  </div>
                  
                  <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                    <Avatar className="h-20 w-20 border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white">
                      <AvatarImage src={logoUrl} className="object-cover" />
                      <AvatarFallback className="bg-zinc-50 dark:bg-zinc-900 text-zinc-400">
                        <Building size={32} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        variant="outline" 
                        className="mb-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        <Upload className="mr-2 h-4 w-4" /> 
                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                      </Button>
                      <p className="text-xs text-zinc-500">Recommended size: 256x256px. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="orgName" className="font-semibold">Organization Name</Label>
                      <Input 
                        id="orgName" 
                        value={orgName} 
                        onChange={(e) => setOrgName(e.target.value)} 
                        placeholder="e.g. Acme Corp" 
                        className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="domain" className="font-semibold flex items-center gap-2">
                        <Globe size={14} className="text-zinc-400" /> Primary Domain
                      </Label>
                      <Input 
                        id="domain" 
                        value={domain} 
                        onChange={(e) => setDomain(e.target.value)} 
                        placeholder="e.g. acme.com" 
                        className="h-11 bg-zinc-50 dark:bg-zinc-900/50"
                      />
                      <p className="text-xs text-zinc-500">Used for single sign-on mapping and email processing.</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="timezone" className="font-semibold">Default Timezone</Label>
                      <select 
                        id="timezone" 
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="flex h-11 w-full rounded-md border border-input bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                      >
                        <option>UTC (Coordinated Universal Time)</option>
                        <option>EST (Eastern Standard Time)</option>
                        <option>PST (Pacific Standard Time)</option>
                        <option>IST (Indian Standard Time)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8 max-w-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Security & Authentication</h3>
                    <p className="text-sm text-zinc-500">Manage how employees access your workspace.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          <Lock size={16} className="text-indigo-500" /> Require Multi-Factor Auth
                        </h4>
                        <p className="text-sm text-zinc-500 mt-1 pr-6">Force all employees to set up 2FA via Authenticator app before they can log in.</p>
                      </div>
                      <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} className="mt-1" />
                    </div>

                    <div className="flex items-start justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          <Globe size={16} className="text-blue-500" /> Single Sign-On (SSO)
                        </h4>
                        <p className="text-sm text-zinc-500 mt-1 pr-6">Allow users to log in directly via Azure AD, Okta, or Google Workspace.</p>
                      </div>
                      <Switch checked={ssoEnabled} onCheckedChange={setSsoEnabled} className="mt-1" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="sessionTimeout" className="font-semibold">Idle Session Timeout (Minutes)</Label>
                      <Input 
                        id="sessionTimeout" 
                        type="number" 
                        value={sessionTimeout} 
                        onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 0)} 
                        className="h-11 bg-zinc-50 dark:bg-zinc-900/50 max-w-[200px]"
                      />
                      <p className="text-xs text-zinc-500">Automatically log out users after this period of inactivity.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-8 max-w-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Global Notifications</h3>
                    <p className="text-sm text-zinc-500">Configure what triggers automated emails and alerts.</p>
                  </div>

                  <div className="space-y-0 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                    
                    <div className="flex items-center justify-between p-5 bg-white dark:bg-zinc-950">
                      <div>
                        <h4 className="font-bold">Critical Incident Alerts</h4>
                        <p className="text-sm text-zinc-500 mt-0.5">Email admins and managers on new P1/P2 incidents.</p>
                      </div>
                      <Switch checked={incidentAlerts} onCheckedChange={setIncidentAlerts} />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-white dark:bg-zinc-950">
                      <div>
                        <h4 className="font-bold">Approval Reminders</h4>
                        <p className="text-sm text-zinc-500 mt-0.5">Send daily emails for pending Change Management CAB approvals.</p>
                      </div>
                      <Switch checked={approvalReminders} onCheckedChange={setApprovalReminders} />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-white dark:bg-zinc-950">
                      <div>
                        <h4 className="font-bold">SLA Breach Warnings</h4>
                        <p className="text-sm text-zinc-500 mt-0.5">Notify assigned agents 1 hour before an SLA breaches.</p>
                      </div>
                      <Switch checked={slaWarnings} onCheckedChange={setSlaWarnings} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sla" && (
                <div className="space-y-8 max-w-3xl">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Service Level Agreements (SLA)</h3>
                    <p className="text-sm text-zinc-500">Define expected resolution times for tickets based on priority.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2 p-5 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
                      <Label className="font-bold text-red-700 dark:text-red-400">P1 (Critical) Resolution Time</Label>
                      <Input type="text" value={p1Sla} onChange={(e) => setP1Sla(e.target.value)} className="bg-white dark:bg-zinc-950" />
                    </div>
                    
                    <div className="grid gap-2 p-5 rounded-xl border border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/10">
                      <Label className="font-bold text-orange-700 dark:text-orange-400">P2 (High) Resolution Time</Label>
                      <Input type="text" value={p2Sla} onChange={(e) => setP2Sla(e.target.value)} className="bg-white dark:bg-zinc-950" />
                    </div>
                    
                    <div className="grid gap-2 p-5 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10">
                      <Label className="font-bold text-blue-700 dark:text-blue-400">P3 (Medium) Resolution Time</Label>
                      <Input type="text" value={p3Sla} onChange={(e) => setP3Sla(e.target.value)} className="bg-white dark:bg-zinc-950" />
                    </div>
                    
                    <div className="grid gap-2 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                      <Label className="font-bold text-zinc-700 dark:text-zinc-400">P4 (Low) Resolution Time</Label>
                      <Input type="text" value={p4Sla} onChange={(e) => setP4Sla(e.target.value)} className="bg-white dark:bg-zinc-950" />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "audit" && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Security Audit Logs</h3>
                    <p className="text-sm text-zinc-500">Track and review critical configuration changes made by administrators.</p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-6 py-4">Action</th>
                          <th className="px-6 py-4">Actor</th>
                          <th className="px-6 py-4">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                              <History className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                              <p className="font-medium">No audit logs found.</p>
                              <p className="text-xs mt-1">Changes made to settings will appear here.</p>
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{log.action}</div>
                                <div className="text-[11px] text-zinc-500 mt-1 font-mono break-all max-w-xs truncate">
                                  {JSON.stringify(log.details)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-[10px] font-bold">
                                    {log.users?.full_name?.charAt(0) || "S"}
                                  </div>
                                  <div>
                                    <div className="font-medium text-zinc-700 dark:text-zinc-300">{log.users?.full_name || "System"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}
