import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, Users, Settings, Activity, ShieldCheck, ArrowRight, Search, Globe, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SuperAdmin = () => {
  const { session, user } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/organizations", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setOrganizations(data.organizations);
      } else {
        toast({ title: "Access Denied", description: data.error || "You are not a Super Admin.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchOrganizations();
  }, [session]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ name: newOrgName, slug: newOrgSlug }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Organization created successfully." });
        setNewOrgName("");
        setNewOrgSlug("");
        setIsDialogOpen(false);
        fetchOrganizations();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Platform Admin</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                <Globe className="h-4 w-4" /> Global SaaS Management Console
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-right hidden sm:block mr-4">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</p>
              <p className="text-zinc-500">Super Administrator</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Total Organizations</p>
                <h3 className="text-3xl font-bold mt-2">{organizations.length}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Active Users</p>
                <h3 className="text-3xl font-bold mt-2">--</h3>
              </div>
              <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">System Status</p>
                <h3 className="text-xl font-bold mt-2 text-green-600 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Operational
                </h3>
              </div>
              <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="organizations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl">
            <TabsTrigger value="organizations" className="rounded-lg">Organizations</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg">Global Users</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizations" className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Registered Workspaces</h2>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm">
                    <Plus className="h-4 w-4 mr-2" /> New Organization
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Organization</DialogTitle>
                    <DialogDescription>Provision a new tenant workspace on the platform.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateOrg}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input id="orgName" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} placeholder="Acme Corp" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="orgSlug">Unique URL Slug</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-md border text-sm">app.orgman.com/</span>
                          <Input id="orgSlug" value={newOrgSlug} onChange={e => setNewOrgSlug(e.target.value)} placeholder="acme" required />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" className="bg-indigo-600 text-white">Create Tenant</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input placeholder="Search organizations..." className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-none" />
                </div>
              </div>
              
              {loading ? (
                <div className="p-12 text-center text-zinc-500">Loading organizations...</div>
              ) : organizations.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
                  <Building2 className="h-12 w-12 text-zinc-300 mb-3" />
                  <p>No organizations found. Or you don't have permission to view them.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-950/50">
                    <TableRow>
                      <TableHead>Organization Name</TableHead>
                      <TableHead>URL Slug</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                              {org.name.substring(0, 2)}
                            </div>
                            {org.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-500 font-mono text-sm">{org.slug}</TableCell>
                        <TableCell className="text-zinc-500 text-sm">{new Date(org.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-indigo-600">
                            Enter <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
              <Users className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global User Directory</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                View and manage all user accounts across the entire platform. Requires Global Admin API integration.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
              <ShieldAlert className="h-12 w-12 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Platform Settings</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                Configure global SaaS limits, feature flags, and billing integrations.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
};

export default SuperAdmin;
