import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Activity, FileText, History, Target, RefreshCcw, Edit, X, Image as ImageIcon, Send, Paperclip, Grid, Calendar, Columns, Plus, MoreHorizontal, GripVertical, CheckSquare, Square, Tag, User, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function ProjectHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const [history, setHistory] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progressText, setProgressText] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'files' | 'tasks'>('timeline');
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'subtasks' | 'details' | 'attachments'>('subtasks');
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("todo");
  const [newSubtasks, setNewSubtasks] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [updatingTask, setUpdatingTask] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!orgId || !id) return;
    setLoading(true);

    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
      
    if (projectData) {
      setProject(projectData);
    }

    const { data, error } = await supabase
      .from("activity_logs")
      .select(`
        *,
        user:users!activity_logs_user_id_fkey (full_name)
      `)
      .eq("resource", "projects")
      .contains("details", { project_id: id })
      .order("occurred_at", { ascending: false });
      
    if (!error && data) {
      setHistory(data);
    }
    
    const { data: tasksData, error: tasksError } = await supabase
      .from("project_tasks")
      .select(`*, assignee:users!project_tasks_assignee_id_fkey(full_name)`)
      .eq("project_id", id)
      .order("order_index", { ascending: true });
      
    if (!tasksError && tasksData) {
      setTasks(tasksData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [orgId, id]);

  const createTask = async () => {
    if (!newTaskTitle.trim() || !orgId || !id) return;
    const tempId = `temp-${Date.now()}`;
    const newTask = {
      id: tempId,
      title: newTaskTitle,
      description: newTaskDesc || null,
      status: newTaskStatus,
      due_date: newTaskDeadline || null,
      sub_tasks: newSubtasks,
      project_id: id,
      organization_id: orgId,
      created_at: new Date().toISOString(),
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskDeadline("");
    setNewTaskStatus("todo");
    setNewTaskStatus("todo");
    setNewSubtasks([]);
    setIsCreatingTask(false);
    
    const { data, error } = await supabase.from('project_tasks').insert([
      { organization_id: orgId, project_id: id, title: newTask.title, description: newTask.description, status: newTask.status, due_date: newTask.due_date, sub_tasks: newTask.sub_tasks }
    ]).select('*, assignee:users!project_tasks_assignee_id_fkey(full_name)').single();

    if (!error && data) {
      setTasks(prev => prev.map(t => t.id === tempId ? data : t));
      toast({ title: "Task added successfully" });
    } else {
      setTasks(prev => prev.filter(t => t.id !== tempId));
      toast({ title: "Failed to add task", variant: "destructive" });
    }
  };

  const markTaskComplete = async (taskId: string) => {
    if (!taskId || taskId.startsWith('temp-')) return;
    setUpdatingTask(true);
    const { error } = await supabase.from('project_tasks').update({ status: 'done' }).eq('id', taskId);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
      setSelectedTask((prev: any) => prev ? { ...prev, status: 'done' } : null);
      toast({ title: "Task marked as complete! ✓" });
    } else {
      toast({ title: "Failed to update task", variant: "destructive" });
    }
    setUpdatingTask(false);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    if (!taskId || taskId.startsWith('temp-')) return;
    const { error } = await supabase.from('project_tasks').update({ status }).eq('id', taskId);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      setSelectedTask((prev: any) => prev ? { ...prev, status } : null);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!taskId || taskId.startsWith('temp-')) return;
    const { error } = await supabase.from('project_tasks').delete().eq('id', taskId);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);
      toast({ title: "Task deleted" });
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };
  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId || taskId.startsWith('temp-')) return;
    
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    
    const { error } = await supabase.from('project_tasks').update({ status }).eq('id', taskId);
    if (error) {
      toast({ title: "Failed to update task", variant: "destructive" });
      fetchHistory();
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const submitProgress = async () => {
    if ((!progressText.trim() && pastedImages.length === 0) || !orgId || !user || !id) return;
    setSubmitting(true);
    
    const { error } = await supabase.from('activity_logs').insert([{
      organization_id: orgId,
      user_id: user.id,
      action: 'update_progress',
      resource: 'projects',
      details: { project_id: id, explanation: progressText, images: pastedImages }
    }]);

    setSubmitting(false);

    if (error) {
      console.error(error);
      toast({ title: "Failed to track progress", variant: "destructive" });
    } else {
      toast({ title: "Progress tracked successfully!" });
      setProgressText("");
      setPastedImages([]);
      fetchHistory();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPastedImages(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (idx: number) => {
    setPastedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Link to="/dashboard/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">{project?.name || 'Loading...'}</span>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">History</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/projects">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center">
              <History className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Project History
              </h1>
              <p className="text-zinc-500 text-sm mt-1 truncate max-w-sm md:max-w-xl">
                {project ? `Audit log for: ${project.name}` : 'Loading project details...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-2xl w-fit mb-8 border border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'timeline' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <History className="h-4 w-4" /> Timeline
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'files' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <Paperclip className="h-4 w-4" /> Files & Attachments
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'tasks' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <Columns className="h-4 w-4" /> PTASK
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Progress Input Section */}
        {activeTab === 'timeline' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                <Edit className="h-5 w-5 text-indigo-500" /> Add Progress Update
              </h3>
              
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-inner">
                <textarea
                  value={progressText}
                  onChange={(e) => setProgressText(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Enter your progress update, notes, or explanation here... (You can also paste images)"
                  className="w-full min-h-[120px] p-4 bg-transparent outline-none resize-y text-sm dark:text-zinc-100 placeholder:text-zinc-400"
                />
                
                {/* Pasted Images Preview */}
                {pastedImages.length > 0 && (
                  <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 bg-white dark:bg-zinc-950">
                    {pastedImages.map((src, idx) => (
                      <div key={idx} className="relative group rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 shadow-sm overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                        <img src={src} alt="Pasted" className="h-16 w-16 object-cover rounded-lg" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={submitProgress} 
                  disabled={submitting || (!progressText.trim() && pastedImages.length === 0)}
                  className="h-11 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Update Progress
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
        )}

        {activeTab === 'timeline' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          {/* Timeline Card */}
          <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Activity Timeline</h2>
                <p className="text-sm font-medium text-zinc-500">Track all updates and progress</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">{history.length} Logs</span>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="h-24 w-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No History Yet</h3>
                <p className="text-zinc-500 max-w-sm">Activities will appear here once progress is made or the project is updated.</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative border-l-2 border-zinc-100 dark:border-zinc-800/80 ml-6 sm:ml-8 space-y-10 pb-4"
              >
                {history.map((log) => {
                  const isStatusUpdate = log.action === 'update_status';
                  const isProgressUpdate = log.action === 'update_progress';
                  const ActionIcon = isProgressUpdate ? RefreshCcw : (isStatusUpdate ? Target : Activity);
                  const color = isProgressUpdate ? 'text-blue-600 dark:text-blue-400' : 'text-indigo-600 dark:text-indigo-400';
                  const bg = isProgressUpdate ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-indigo-100 dark:bg-indigo-900/40';
                  const border = isProgressUpdate ? 'border-blue-200 dark:border-blue-800' : 'border-indigo-200 dark:border-indigo-800';
                  
                  return (
                    <motion.div variants={itemVariants} key={log.id} className="relative pl-10 sm:pl-12">
                      {/* Timeline Node */}
                      <div className="absolute -left-[1.35rem] top-1 h-10 w-10 rounded-full bg-white dark:bg-zinc-950 border-4 border-white dark:border-zinc-950 flex items-center justify-center z-10 shadow-sm">
                        <div className={`h-full w-full rounded-full flex items-center justify-center shadow-sm ${bg} ${color} ${border} border`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                      </div>
                      
                      {/* Action Card */}
                      <div className="group bg-white dark:bg-zinc-950 rounded-2xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
                                {getInitials(log.user?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                                {log.user?.full_name || 'System'}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium capitalize">
                                {log.action.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(log.occurred_at).toLocaleString(undefined, {
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <div className="text-[15px] text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          {isStatusUpdate ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>Changed project status from</span>
                              <span className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 font-semibold text-sm border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                {log.details?.old_value}
                              </span>
                              <ArrowLeft className="h-4 w-4 rotate-180 text-zinc-400" />
                              <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold text-sm border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                                {log.details?.new_value}
                              </span>
                            </div>
                          ) : isProgressUpdate ? (
                              log.details?.explanation ? (
                                <div className="space-y-4">
                                  <div className="whitespace-pre-wrap">{log.details.explanation}</div>
                                  {log.details.images && log.details.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {log.details.images.map((img: string, i: number) => (
                                        <img 
                                          key={i} 
                                          src={img} 
                                          alt="Progress attachment" 
                                          className="h-24 w-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                          onClick={() => setViewingImage(img)}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span>Updated project progress from</span>
                                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 font-semibold font-mono text-sm border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    {log.details?.old_value}%
                                  </span>
                                  <ArrowLeft className="h-4 w-4 rotate-180 text-zinc-400" />
                                  <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold font-mono text-sm border border-blue-200 dark:border-blue-800/50 shadow-sm">
                                    {log.details?.new_value}%
                                  </span>
                                </div>
                              )
                          ) : (
                            <span>Performed action: <strong className="text-zinc-800 dark:text-zinc-200">{log.action}</strong></span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
      )}

      {activeTab === 'files' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <Grid className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Project Files</h2>
                  <p className="text-sm font-medium text-zinc-500">All attachments uploaded to this project</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-zinc-500 font-medium">Loading files...</p>
                </div>
              ) : (() => {
                const allImages = history.flatMap(log => 
                  (log.details?.images || []).map((img: string) => ({ src: img, date: log.occurred_at, user: log.user?.full_name }))
                );
                
                if (allImages.length === 0) {
                  return (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <div className="h-24 w-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
                        <ImageIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No Files Yet</h3>
                      <p className="text-zinc-500 max-w-sm">Images and attachments pasted in progress updates will appear here.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {allImages.map((img, i) => (
                      <div key={i} className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-square shadow-sm hover:shadow-md transition-all cursor-pointer bg-zinc-50 dark:bg-zinc-900" onClick={() => setViewingImage(img.src)}>
                        <img src={img.src} alt="Attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <span className="text-white text-xs font-bold truncate">{img.user || 'System'}</span>
                          <span className="text-zinc-300 text-[10px] font-medium flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" /> {new Date(img.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'tasks' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="space-y-8">
          
          {/* Create Task Form */}
          {isCreatingTask ? (
          <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Plus className="h-5 w-5 text-indigo-500" /> Create PTASK
                </h3>
                <button onClick={() => setIsCreatingTask(false)} className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Task Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Design new landing page..." 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createTask()}
                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-inner text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea 
                    placeholder="Add a brief description of the task..." 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none shadow-inner text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1"><Calendar className="h-3 w-3" /> Deadline</label>
                  <input 
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-inner text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1"><Columns className="h-3 w-3" /> Status</label>
                  <select 
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-inner text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="todo">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 mt-2">
                  <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckSquare className="h-3 w-3" /> Sub-tasks (Optional)</label>
                  
                  {newSubtasks.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {newSubtasks.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <CheckSquare className="h-4 w-4 text-zinc-300" />
                          <span className="text-sm font-medium flex-1 text-zinc-700 dark:text-zinc-300">{st.title}</span>
                          <button onClick={() => setNewSubtasks(prev => prev.filter((_, i) => i !== idx))} className="text-zinc-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input 
                    type="text"
                    placeholder="Type a sub-task and press Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        setNewSubtasks([...newSubtasks, { id: Date.now().toString(), title: e.currentTarget.value.trim(), checked: false }]);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full h-11 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-solid outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button 
                  variant="ghost"
                  onClick={() => setIsCreatingTask(false)} 
                  className="h-11 rounded-xl font-bold text-zinc-500"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createTask} 
                  disabled={!newTaskTitle.trim()}
                  className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 px-6 font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </div>
            </div>
          </Card>
          ) : (
            <div 
              onClick={() => setIsCreatingTask(true)}
              className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all group shadow-sm bg-white dark:bg-zinc-950"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Create PTASK</h3>
                  <p className="text-sm text-zinc-500 font-medium">Add a new task to this project timeline</p>
                </div>
              </div>
              <Button className="rounded-xl font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-sm pointer-events-none px-6">
                Get Started
              </Button>
            </div>
          )}

          {/* Tasks Table List */}
          {tasks.length === 0 ? (
            <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden mt-6">
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No Tasks Yet</h3>
                <p className="text-sm text-zinc-500">Create your first task using the form above to get started.</p>
              </div>
            </Card>
          ) : (
            <div className="bg-white dark:bg-zinc-950 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden mt-8">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <div className="col-span-4">Task Details</div>
                <div className="col-span-3">Project & Team</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-1 flex justify-end">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {tasks.slice().reverse().map((task, idx) => {
                  
                  // Mock priority since it's not in schema (can derive from ID or tags in future)
                  const pBadge = idx % 3 === 0 ? { label: 'URGENT PRIORITY', classes: 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50' }
                    : idx % 3 === 1 ? { label: 'LOW PRIORITY', classes: 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50' }
                    : { label: 'MEDIUM PRIORITY', classes: 'bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' };

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      key={task.id} 
                      className={`grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group ${task.id.startsWith('temp-') ? 'opacity-50 animate-pulse' : ''}`}
                      onClick={() => navigate('/dashboard/tasks/' + task.id)}
                    >
                      {/* TASK DETAILS */}
                      <div className="col-span-4 flex flex-col items-start gap-2">
                        <span className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                          {task.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${pBadge.classes}`}>
                          {pBadge.label}
                        </span>
                      </div>
                      
                      {/* PROJECT & TEAM */}
                      <div className="col-span-3 flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">{project?.name || 'Organization Project'}</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Team: {project?.name || 'General'}</span>
                      </div>

                      {/* STATUS */}
                      <div className="col-span-2">
                          <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            task.status === 'done' ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : task.status === 'review' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : task.status === 'in_progress' ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}>
                            {task.status === 'todo' ? 'New' : task.status?.replace('_', ' ')}
                          </span>
                      </div>

                      {/* ASSIGNEE */}
                      <div className="col-span-2 flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                          <AvatarFallback className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            {task.assignee ? getInitials(task.assignee.full_name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
                          {task.assignee?.full_name || 'Unassigned'}
                        </span>
                      </div>

                      {/* ACTIONS */}
                      <div className="col-span-1 flex items-center justify-end gap-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1" onClick={(e) => { e.stopPropagation(); /* edit */ }}>
                          <Edit className="h-[15px] w-[15px]" />
                        </button>
                        <button className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1" onClick={(e) => { e.stopPropagation(); /* menu */ }}>
                          <MoreHorizontal className="h-[17px] w-[17px]" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
      </div>
      {viewingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="absolute -top-12 right-0">
              <Button variant="ghost" size="icon" onClick={() => setViewingImage(null)} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <img src={viewingImage} alt="Expanded view" className="object-contain max-h-[85vh] rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
}