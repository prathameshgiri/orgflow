import React, { useState, useEffect } from "react";
import { BookOpen, Search, Plus, ExternalLink, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchArticles = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select(`
        *,
        author:author_id(full_name),
        likes:article_likes(count)
      `)
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

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-zinc-500">Internal documentation, runbooks, and FAQs.</p>
          </div>
          
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
            <Link to="/dashboard/knowledge/create">
              <Plus className="mr-2 h-4 w-4" /> New Article
            </Link>
          </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredArticles.map(article => {
            const likesCount = article.likes?.[0]?.count || 0;
            return (
              <Link to={`/dashboard/knowledge/${article.id}`} key={article.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-indigo-600">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-3 mb-4 flex-grow">{article.content}</p>
                
                <div className="flex justify-between items-center text-xs text-zinc-400 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-600 dark:text-zinc-300 font-medium">{article.author?.full_name || "Unknown Author"}</span>
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-md">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{likesCount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
