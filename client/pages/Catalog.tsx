import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Search, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function Catalog() {
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!orgId || !user) return;
    setLoading(true);
    
    // 1. Get user's teams
    const { data: userTeams } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);
      
    const teamIds = userTeams?.map(t => t.team_id) || [];

    // 2. Fetch catalog items
    let query = supabase
      .from("catalog_items")
      .select("*, team:teams(name)")
      .order("name", { ascending: true });
      
    if (teamIds.length > 0) {
      query = query.in('team_id', teamIds);
    } else {
      query = query.is('team_id', null);
    }
      
    const { data, error } = await query;
      
    if (error) console.error("Error fetching catalog:", error);
    
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [orgId, user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const { error } = await supabase.from("catalog_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Item deleted successfully" });
      fetchData();
    }
  };

  const filteredItems = items.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Service Catalog</h1>
          <p className="text-zinc-500 text-sm sm:text-base">Browse and manage available services for your teams.</p>
        </div>
        
        <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          <Link to="/dashboard/catalog/create">
            <Plus className="mr-2 h-4 w-4" /> Add Catalog Item
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Input 
            placeholder="Search services..." 
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading catalog items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <CheckSquare className="h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-zinc-500 max-w-sm">No services are assigned to your team yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead className="whitespace-nowrap min-w-[200px]">Service Name</TableHead>
                  <TableHead className="whitespace-nowrap">Description</TableHead>
                  <TableHead className="whitespace-nowrap">Price</TableHead>
                  <TableHead className="whitespace-nowrap">Team</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium min-w-[200px]">{item.name}</TableCell>
                    <TableCell className="text-zinc-500 whitespace-nowrap truncate max-w-xs">{item.description || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.price ? `$${item.price}` : 'Free'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.team_id ? (
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.team?.name || '-'}</span>
                      ) : (
                        <span className="text-sm italic text-zinc-400 dark:text-zinc-500">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap ${item.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild className="flex items-center cursor-pointer">
                            <Link to={`/dashboard/catalog/edit/${item.id}`}>
                              <Edit3 className="mr-2 h-4 w-4 text-blue-500" /> Edit Item
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item.id)} className="flex items-center cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
