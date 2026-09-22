import React, { useState, useEffect } from "react";
import { BookOpen, Search, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchArticles = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      toast({ title: "Error loading articles", variant: "destructive" });
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user) return;
    
    const { data, error } = await supabase.from("knowledge_articles").insert([
      {
        organization_id: orgId,
        title,
        content,
        author_id: user.id,
        is_published: true,
      }
    ]);

    if (error) {
      console.error(error);
      toast({ title: "Failed to publish article", variant: "destructive" });
    } else {
      toast({ title: "Article published successfully" });
      setIsDialogOpen(false);
      setTitle("");
      setContent("");
      fetchArticles();
    }
  };

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-zinc-500">Internal documentation, runbooks, and FAQs.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Write Knowledge Article</DialogTitle>
                <DialogDescription>
                  Share documentation with your organization.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Article Title</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. How to connect to the Corporate VPN" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content (Markdown supported)</Label>
                    <textarea 
                      id="content" 
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                      placeholder="Write your documentation here..."
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Publish Article</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
          <Input 
            className="pl-10 h-12 text-lg" 
            placeholder="Search for answers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-zinc-500">Loading articles...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <BookOpen className="h-12 w-12 text-zinc-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Knowledge Base is empty</h3>
          <p className="text-zinc-500 max-w-sm">Start building your organization's knowledge repository by writing the first article.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <div key={article.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-indigo-600">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-zinc-500 text-sm line-clamp-3 mb-4">{article.content}</p>
              <div className="flex justify-between items-center text-xs text-zinc-400 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                <span>{article.view_count || 0} views</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
