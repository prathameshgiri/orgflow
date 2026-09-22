import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function CreateCatalog() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [teamId, setTeamId] = useState("none");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      if (!orgId) return;
      const { data } = await supabase.from("teams").select("*").eq("organization_id", orgId);
      setTeams(data || []);
      setLoading(false);
    }
    fetchTeams();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !name) return;
    
    setIsSubmitting(true);
    
    const payload = {
      organization_id: orgId,
      name,
      description: description || null,
      price: price ? parseFloat(price) : null,
      team_id: teamId === "none" ? null : teamId,
      is_active: isActive
    };

    const { error } = await supabase.from("catalog_items").insert([payload]);

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Catalog item created successfully" });
      navigate("/dashboard/catalog");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading form...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Link to="/dashboard/catalog">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Catalog Item</h1>
          <p className="text-zinc-500 text-sm">Add a new service to the catalog for your teams to request.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name <span className="text-red-500">*</span></Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Request New Laptop" className="max-w-md" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe the service..." />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Owning Team</Label>
              <select 
                id="team" 
                value={teamId} 
                onChange={(e) => setTeamId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="none">Unassigned</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="active" 
              checked={isActive} 
              onChange={(e) => setIsActive(e.target.checked)} 
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="active" className="cursor-pointer">Active Service</Label>
          </div>
          
          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" asChild>
              <Link to="/dashboard/catalog">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Catalog Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
