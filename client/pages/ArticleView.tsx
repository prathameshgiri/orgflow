import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ThumbsUp, Calendar, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { session, user: currentUser } = useAuth();
  const { toast } = useToast();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!orgId || !id) return;
    
    const fetchArticle = async () => {
      setLoading(true);
      try {
        // Fetch article details
        const { data, error } = await supabase
          .from("knowledge_articles")
          .select(`
            *,
            author:author_id(full_name),
            likes:article_likes(count)
          `)
          .eq("id", id)
          .eq("organization_id", orgId)
          .single();

        if (error) throw error;
        
        setArticle(data);
        setLikesCount(data.likes?.[0]?.count || 0);

        // Check if the current user liked it
        if (currentUser) {
          const { data: likeData } = await supabase
            .from("article_likes")
            .select("user_id")
            .eq("article_id", id)
            .eq("user_id", currentUser.id)
            .maybeSingle();

          if (likeData) setIsLiked(true);
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Article not found", variant: "destructive" });
        navigate("/dashboard/knowledge");
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, orgId, currentUser]);

  const handleLike = async () => {
    if (!currentUser || !id) return;
    
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      if (newIsLiked) {
        await supabase.from("article_likes").insert({
          article_id: id,
          user_id: currentUser.id
        });
      } else {
        await supabase.from("article_likes").delete()
          .eq("article_id", id)
          .eq("user_id", currentUser.id);
      }
    } catch (error) {
      console.error(error);
      // Revert optimistic update on error
      setIsLiked(!newIsLiked);
      setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    
    try {
      const { error } = await supabase
        .from("knowledge_articles")
        .delete()
        .eq("id", id)
        .eq("organization_id", orgId);
        
      if (error) throw error;
      
      toast({ title: "Article deleted successfully" });
      navigate("/dashboard/knowledge");
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to delete article", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-zinc-500">Loading article...</div>;
  }

  if (!article) return null;

  const isAuthor = currentUser?.id === article.author_id;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0" asChild>
            <Link to="/dashboard/knowledge">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">{article.title}</h1>
          </div>
        </div>
        {isAuthor && (
          <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 ml-4 font-bold rounded-xl shadow-sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
            <User className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-zinc-700 dark:text-zinc-300">{article.author?.full_name || "Unknown Author"}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-zinc-700 dark:text-zinc-300">{new Date(article.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Button 
          variant={isLiked ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-2 h-10 px-5 rounded-xl font-bold shadow-sm transition-all ${
            isLiked 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-indigo-500/25 border-none' 
              : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : 'text-zinc-500'}`} />
          <span className={isLiked ? '' : 'text-zinc-700 dark:text-zinc-300'}>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm p-8 md:p-12 relative overflow-hidden">
        <article className="prose prose-zinc dark:prose-invert prose-lg max-w-none prose-headings:font-extrabold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
          <div className="whitespace-pre-wrap font-sans leading-relaxed break-words text-zinc-800 dark:text-zinc-200">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({node, ...props}) => (
                  <a href={props.src} target="_blank" rel="noopener noreferrer" className="block w-fit">
                    <img 
                      className="rounded-xl max-h-96 w-auto my-6 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-shadow cursor-zoom-in" 
                      {...props} 
                    />
                  </a>
                )
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
