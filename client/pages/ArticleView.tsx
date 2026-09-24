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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/knowledge">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
        </div>
        {isAuthor && (
          <Button variant="destructive" size="sm" onClick={handleDelete} className="ml-auto">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{article.author?.full_name || "Unknown Author"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(article.created_at).toLocaleDateString()}</span>
        </div>
        <Button 
          variant={isLiked ? "default" : "secondary"}
          size="sm"
          onClick={handleLike}
          className={`ml-auto flex items-center gap-2 rounded-full px-4 ${isLiked ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount} Likes</span>
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-8 sm:p-12">
        <article className="prose prose-zinc dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap font-sans text-base leading-relaxed break-words">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({node, ...props}) => (
                  <a href={props.src} target="_blank" rel="noopener noreferrer" className="block w-fit">
                    <img 
                      className="rounded-md max-h-80 w-auto my-4 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow cursor-zoom-in" 
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
