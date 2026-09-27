import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckSquare, Bold, Italic, Heading, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0" asChild>
          <Link to="/dashboard/knowledge">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            Write Knowledge Article
          </h1>
          <p className="text-zinc-500 mt-1">Share documentation, runbooks, and FAQs with your organization.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <div className="space-y-6">
            
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Article Title</Label>
              <Input 
                id="title" 
                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 text-lg font-bold"
                placeholder="e.g. How to connect to the Corporate VPN" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Content (Markdown supported)</Label>
              </div>
              
              <Tabs defaultValue="write" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
                  <TabsTrigger value="write" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm font-bold flex items-center gap-2">
                    <Edit3 className="h-4 w-4" /> Write
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm font-bold flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Preview
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="write" className="mt-0 outline-none">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white dark:bg-zinc-900/30">
                    <textarea 
                      id="content" 
                      ref={textareaRef}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      onPaste={handlePaste}
                      className="flex min-h-[448px] w-full bg-transparent px-5 py-5 text-[15px] outline-none font-mono resize-y leading-relaxed text-zinc-800 dark:text-zinc-200"
                      placeholder="Write your documentation here using Markdown..."
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="mt-0 outline-none">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 p-6 sm:p-8 min-h-[448px] shadow-sm">
                    {content.trim() ? (
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
                            {content}
                          </ReactMarkdown>
                        </div>
                      </article>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-zinc-400">
                        <Eye className="h-12 w-12 mb-4 opacity-50" />
                        <p className="font-medium">Nothing to preview yet</p>
                        <p className="text-sm mt-1">Start writing to see the preview</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

          </div>

          <div className="mt-10 flex items-center justify-end gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" className="rounded-xl h-12 px-6 font-bold" onClick={() => navigate('/dashboard/knowledge')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 px-8 rounded-xl h-12 font-bold transition-all min-w-[180px]">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Publishing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
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
