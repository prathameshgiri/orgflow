import React, { useState, useEffect } from "react";
import { Laptop, Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function Assets() {
  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [model, setModel] = useState("");

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAssets = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      toast({ title: "Error loading assets", variant: "destructive" });
    } else {
      setAssets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user) return;
    
    const { data, error } = await supabase.from("assets").insert([
      {
        organization_id: orgId,
        name,
        asset_tag: assetTag,
        model,
      }
    ]);

    if (error) {
      console.error(error);
      toast({ title: "Failed to add asset", variant: "destructive" });
    } else {
      toast({ title: "Asset registered successfully" });
      setIsDialogOpen(false);
      setName("");
      setAssetTag("");
      setModel("");
      fetchAssets();
    }
  };

  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || (a.asset_tag && a.asset_tag.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-zinc-500">Manage hardware, software licenses, and inventory.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Asset</DialogTitle>
              <DialogDescription>
                Add a new hardware or software asset to the registry.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MacBook Pro M3" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assetTag">Asset Tag / Identifier</Label>
                  <Input id="assetTag" value={assetTag} onChange={e => setAssetTag(e.target.value)} placeholder="e.g. TAG-00124" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model / Serial Number</Label>
                  <Input id="model" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. A2992" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Asset</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search assets..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Laptop className="h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Asset registry is empty</h3>
            <p className="text-zinc-500 max-w-sm">You haven't added any hardware or software assets to the registry yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell className="text-zinc-500">{asset.asset_tag || '-'}</TableCell>
                  <TableCell className="text-zinc-500">{asset.model || '-'}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
                      {asset.status?.replace('_', ' ').toUpperCase() || 'IN USE'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
