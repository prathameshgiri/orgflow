import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckSquare, Bold, Italic, Heading, Link as LinkIcon, Image as ImageIcon, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";

export default function CreateArticle() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { session, user: currentUser } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    
    const newContent = before + prefix + (selection || "text") + suffix + after;
    setContent(newContent);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, start + prefix.length + (selection || "text").length);
    }, 0);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;

        const placeholder = `![Uploading image...]()\n`;
        insertMarkdown(placeholder);
        
        try {
          const fileExt = file.name ? file.name.split('.').pop() : 'png';
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('article_images')
            .upload(fileName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('article_images')
            .getPublicUrl(fileName);

          setContent(prev => prev.replace(placeholder, `![Image](${publicUrl})\n`));
        } catch (error: any) {
          console.error("Upload error:", error);
          toast({ 
            title: "Image upload failed", 
            description: error.message || "Ensure the 'article_images' bucket exists.", 
            variant: "destructive" 
          });
          setContent(prev => prev.replace(placeholder, ""));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !currentUser) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.from("knowledge_articles").insert([
        {
          organization_id: orgId,
          title,
          content,
          author_id: currentUser.id,
          is_published: true,
        }
      ]);

      if (error) throw error;

      toast({ title: "Success", description: "Article published successfully." });
      navigate('/dashboard/knowledge');
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "Failed to publish article", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/knowledge">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Write Knowledge Article</h1>
          <p className="text-zinc-500">Share documentation, runbooks, and FAQs with your organization.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="space-y-6">
            
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base font-semibold">Article Title</Label>
              <Input 
                id="title" 
                className="h-11 text-lg font-medium"
                placeholder="e.g. How to connect to the Corporate VPN" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content" className="text-base font-semibold">Content (Markdown supported)</Label>
              
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 p-2 flex items-center gap-1 flex-wrap">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => insertMarkdown("**", "**")} title="Bold">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => insertMarkdown("*", "*")} title="Italic">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => insertMarkdown("### ")} title="Heading">
                    <Heading className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => insertMarkdown("[", "](https://)")} title="Link">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => insertMarkdown("![", "](https://)")} title="Image">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => insertMarkdown("- ")} title="Bullet List">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => insertMarkdown("1. ")} title="Numbered List">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </div>
                
                <textarea 
                  id="content" 
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onPaste={handlePaste}
                  className="flex min-h-[400px] w-full bg-background px-4 py-3 text-base outline-none font-mono resize-y"
                  placeholder="Write your documentation here... Use the toolbar above to format."
                  required
                />
              </div>
            </div>

          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/knowledge')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Publishing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>Publish Article</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
