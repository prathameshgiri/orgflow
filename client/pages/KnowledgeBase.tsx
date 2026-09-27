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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" /> Knowledge Base
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Internal documentation, runbooks, and FAQs.</p>
        </div>
        
        <Button asChild className="group relative h-11 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
          <Link to="/dashboard/knowledge/create">
            <span className="relative z-10 flex items-center justify-center">
              <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> 
              New Article
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
          </Link>
        </Button>
      </div>

      <div className="relative max-w-2xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <Input 
          className="pl-12 h-14 text-lg rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-sm focus-visible:ring-indigo-500" 
          placeholder="Search for answers..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="p-16 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Knowledge Base is empty</h3>
          <p className="text-zinc-500 max-w-sm">Start building your organization's knowledge repository by writing the first article.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map(article => {
            const likesCount = article.likes?.[0]?.count || 0;
            return (
              <Link to={`/dashboard/knowledge/${article.id}`} key={article.id} className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 group flex flex-col h-[280px]">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-indigo-600 bg-white dark:bg-zinc-900 shadow-sm rounded-full">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-extrabold text-xl mb-3 text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-2 mb-4 flex-grow">{article.content}</p>
                
                <div className="flex justify-between items-center text-xs mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-700 dark:text-zinc-300 font-bold">{article.author?.full_name || "Unknown Author"}</span>
                    <span className="text-zinc-400 font-medium">{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
                    <ThumbsUp className="h-4 w-4 text-indigo-500" />
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
