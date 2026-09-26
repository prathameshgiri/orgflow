import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Calendar, Tag, User, CheckCircle2, 
  MoreHorizontal, MessageSquare, Clock, AlignLeft, 
  CheckSquare, Square, X, Plus, Paperclip, Users
} from "lucide-react";

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [task, setTask] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  
  const [dueDate, setDueDate] = useState<string>("");
  
  // Organization Metadata for assigning
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [orgTeams, setOrgTeams] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const fetchTask = async () => {
    if (!id) return;
    setLoading(true);
    
    const { data: taskData, error } = await supabase
      .from('project_tasks')
      .select('*, assignee:users!project_tasks_assignee_id_fkey(full_name), team:teams!project_tasks_team_id_fkey(name)')
      .eq('id', id)
      .single();
      
    if (taskData) {
      setTask(taskData);
      setSubtasks(taskData.sub_tasks || []);
      setComments(taskData.comments || []);
      setTags(taskData.tags || []);
      setDueDate(taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : "");
      
      // Fetch project details
      if (taskData.project_id) {
        const { data: projData } = await supabase.from('projects').select('name').eq('id', taskData.project_id).single();
        if (projData) setProject(projData);
      }
      
      // Fetch org users and teams
      if (taskData.organization_id) {
        const { data: usersData } = await supabase.from('users').select('id, full_name, email').eq('organization_id', taskData.organization_id);
        if (usersData) setOrgUsers(usersData);
        
        const { data: teamsData } = await supabase.from('teams').select('id, name').eq('organization_id', taskData.organization_id);
        if (teamsData) setOrgTeams(teamsData);
        
        const { data: tmData } = await supabase.from('team_members').select('team_id, user_id');
        if (tmData) setTeamMembers(tmData);
      }
    } else {
      toast({ title: "Task not found", variant: "destructive" });
      navigate(-1);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    const { error } = await supabase.from('project_tasks').update({ status }).eq('id', id);
    if (!error) {
      setTask({ ...task, status });
      toast({ title: "Status updated successfully" });
    }
    setUpdating(false);
  };

  const updateAssignee = async (assignee_id: string) => {
    const newAssigneeId = assignee_id === 'unassigned' ? null : assignee_id;
    setUpdating(true);
    const { error } = await supabase.from('project_tasks').update({ assignee_id: newAssigneeId }).eq('id', id);
    if (!error) {
      const selectedUser = orgUsers.find(u => u.id === newAssigneeId);
      setTask({ ...task, assignee_id: newAssigneeId, assignee: selectedUser ? { full_name: selectedUser.full_name } : null });
      toast({ title: "Assignee updated" });
    }
    setUpdating(false);
  };

  const updateTeam = async (team_id: string) => {
    const newTeamId = team_id === 'none' ? null : team_id;
    setUpdating(true);
    const { error } = await supabase.from('project_tasks').update({ team_id: newTeamId }).eq('id', id);
    if (!error) {
      const selectedTeam = orgTeams.find(t => t.id === newTeamId);
      setTask({ ...task, team_id: newTeamId, team: selectedTeam ? { name: selectedTeam.name } : null });
      toast({ title: "Team updated" });
    }
    setUpdating(false);
  };

  const updateDueDate = async (dateStr: string) => {
    setDueDate(dateStr);
    const isoDate = dateStr ? new Date(dateStr).toISOString() : null;
    await supabase.from('project_tasks').update({ due_date: isoDate }).eq('id', id);
    setTask({ ...task, due_date: isoDate });
    toast({ title: "Due date updated" });
  };

  const toggleSubtask = async (idx: number) => {
    const updated = [...subtasks];
    updated[idx].checked = !updated[idx].checked;
    setSubtasks(updated);
    await supabase.from('project_tasks').update({ sub_tasks: updated }).eq('id', id);
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    const updated = [...subtasks, { id: Date.now().toString(), title: newSubtask.trim(), checked: false }];
    setSubtasks(updated);
    setNewSubtask("");
    setIsAddingSubtask(false);
    await supabase.from('project_tasks').update({ sub_tasks: updated }).eq('id', id);
  };

  const removeSubtask = async (idx: number) => {
    const updated = subtasks.filter((_, i) => i !== idx);
    setSubtasks(updated);
    await supabase.from('project_tasks').update({ sub_tasks: updated }).eq('id', id);
  };

  const addTag = async () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    const updated = [...tags, newTag.trim()];
    setTags(updated);
    setNewTag("");
    setIsAddingTag(false);
    await supabase.from('project_tasks').update({ tags: updated }).eq('id', id);
  };

  const removeTag = async (tagToRemove: string) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    await supabase.from('project_tasks').update({ tags: updated }).eq('id', id);
  };

  const addComment = async () => {
    if (!commentText.trim() || !user) return;
    const newComment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      user_id: user.id,
      user_name: (user as any)?.user_metadata?.full_name || user.email,
      created_at: new Date().toISOString()
    };
    const updated = [...comments, newComment];
    setComments(updated);
    setCommentText("");
    await supabase.from('project_tasks').update({ comments: updated }).eq('id', id);
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#FDFDFD] dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-800 dark:border-t-indigo-500"></div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-zinc-950 flex justify-center pb-20">
      <div className="w-full max-w-6xl px-6 sm:px-10 animate-in fade-in duration-700">
        
        {/* Top Header / Breadcrumbs */}
        <div className="flex items-center justify-between py-6 sticky top-0 bg-[#FDFDFD]/90 dark:bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-sm font-medium text-zinc-500">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link to="/dashboard/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
            <span>/</span>
            <Link to={`/dashboard/projects/${task.project_id}/history`} className="hover:text-indigo-600 transition-colors truncate max-w-[150px]">
              {project?.name || 'Project'}
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold font-mono text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-md">
              TSK-{task.id.substring(0, 6).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-zinc-600 dark:text-zinc-300">
              <MoreHorizontal className="h-4 w-4 mr-2" /> More
            </Button>
            <Button onClick={() => updateStatus('done')} className="h-9 px-5 rounded-xl bg-[#6E3BFE] hover:bg-[#5a2ed6] text-white font-bold shadow-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Complete Task
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 mt-8">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-10">
            {/* Title Section */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight">
                {task.title}
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Created by You
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-800 dark:text-zinc-200">
                <AlignLeft className="h-5 w-5 text-[#6E3BFE]" /> Description
              </h3>
              <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-6 min-h-[120px]">
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {task.description || "No description provided for this task. Add more details to help your team understand the requirements."}
                </p>
              </div>
            </div>

            {/* Sub-tasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  <CheckSquare className="h-5 w-5 text-emerald-500" /> Sub-tasks
                </h3>
                <span className="text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">
                  {subtasks.filter(s => s.checked).length} / {subtasks.length} Done
                </span>
              </div>
              
              <div className="space-y-2">
                {subtasks.map((subtask, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={subtask.id || idx} 
                    className="group flex items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-[#6E3BFE]/50 dark:hover:border-[#6E3BFE]/50 rounded-xl p-4 transition-all shadow-sm"
                  >
                    <button onClick={() => toggleSubtask(idx)} className="shrink-0 transition-transform active:scale-90">
                      {subtask.checked 
                        ? <CheckSquare className="h-5 w-5 text-emerald-500" /> 
                        : <Square className="h-5 w-5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400" />
                      }
                    </button>
                    <span className={`flex-1 text-[15px] font-medium transition-colors ${subtask.checked ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {subtask.title}
                    </span>
                    <button onClick={() => removeSubtask(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950 transition-all">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
                
                {isAddingSubtask ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      autoFocus
                      type="text" 
                      value={newSubtask} 
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                      placeholder="What needs to be done?" 
                      className="flex-1 h-12 px-4 rounded-xl border-2 border-[#6E3BFE] bg-white dark:bg-zinc-900/50 outline-none text-[14px]"
                    />
                    <Button onClick={addSubtask} className="h-12 px-6 rounded-xl bg-[#6E3BFE] hover:bg-[#5a2ed6] font-bold text-white">Add</Button>
                    <Button variant="ghost" onClick={() => setIsAddingSubtask(false)} className="h-12 w-12 rounded-xl text-zinc-400">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <button onClick={() => setIsAddingSubtask(true)} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400 font-semibold text-[14px] hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all mt-2">
                    <Plus className="h-4 w-4" /> Add new sub-task
                  </button>
                )}
              </div>
            </div>
            
            {/* Activity/Comments */}
            <div className="space-y-4 pt-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-800 dark:text-zinc-200">
                <MessageSquare className="h-5 w-5 text-blue-500" /> Activity & Comments
              </h3>
              
              <div className="flex gap-4 mt-6 mb-8">
                <Avatar className="h-10 w-10 shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <AvatarFallback className="bg-[#6E3BFE] text-white font-bold">{getInitials((user as any)?.user_metadata?.full_name || user?.email || 'U')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#6E3BFE] focus-within:border-[#6E3BFE] transition-all overflow-hidden">
                  <textarea 
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write an update or comment..."
                    className="w-full p-4 bg-transparent outline-none text-[15px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 resize-none"
                  />
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                    <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <Button onClick={addComment} disabled={!commentText.trim()} className="h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs px-4 disabled:opacity-50">
                      Comment
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {comments.slice().reverse().map((comment, idx) => (
                  <div key={comment.id || idx} className="flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0 border border-zinc-200 dark:border-zinc-800">
                      <AvatarFallback className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold">{getInitials(comment.user_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[14px]">{comment.user_name}</span>
                        <span className="text-zinc-400 text-[12px]">{new Date(comment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 text-[15px] bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 inline-block w-full">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          {/* Right Sidebar - Properties */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden sticky top-28">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-[14px]">Properties</h3>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Status */}
                <div>
                  <label className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5 block uppercase tracking-wider">Status</label>
                  <div className="relative">
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(e.target.value)}
                      disabled={updating}
                      className={`w-full appearance-none px-4 py-2.5 rounded-xl text-[14px] font-bold outline-none border cursor-pointer bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M4%206L8%2010L12%206%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] transition-all shadow-sm
                        ${task.status === 'todo' ? 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800'
                          : task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                          : task.status === 'review' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'}`}
                    >
                      <option value="todo">New / To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="done">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Team */}
                <div>
                  <label className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5 block uppercase tracking-wider">Team</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-zinc-400" />
                    </div>
                    <select
                      value={task.team_id || 'none'}
                      onChange={(e) => updateTeam(e.target.value)}
                      disabled={updating}
                      className="w-full appearance-none pl-10 pr-4 py-3 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-200 outline-none border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/30 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M4%206L8%2010L12%206%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] transition-colors"
                    >
                      <option value="none">No team selected</option>
                      {orgTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5 block uppercase tracking-wider">Assignee</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                      <Avatar className="h-7 w-7 bg-[#6E3BFE] text-white shadow-sm ml-1">
                        <AvatarFallback className="text-[10px] font-bold bg-transparent">
                          {task.assignee ? getInitials(task.assignee.full_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <select
                      value={task.assignee_id || 'unassigned'}
                      onChange={(e) => updateAssignee(e.target.value)}
                      disabled={updating}
                      className="w-full appearance-none pl-12 pr-4 py-3 rounded-xl text-[14px] font-semibold text-zinc-800 dark:text-zinc-200 outline-none border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/30 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M4%206L8%2010L12%206%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] transition-colors"
                    >
                      <option value="unassigned">Unassigned</option>
                      {(() => {
                        const filtered = task.team_id && task.team_id !== 'none' 
                          ? orgUsers.filter(u => u.id === task.assignee_id || teamMembers.some(tm => tm.team_id === task.team_id && tm.user_id === u.id))
                          : orgUsers;
                        return filtered.map(user => (
                          <option key={user.id} value={user.id}>{user.full_name}</option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5 block uppercase tracking-wider">Due Date</label>
                  <div className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => updateDueDate(e.target.value)}
                        className="w-full bg-transparent text-[14px] font-bold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                      />
                      {!task.due_date && <div className="text-[12px] text-zinc-500 font-medium">Select a date</div>}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5 block uppercase tracking-wider">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="group px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg text-[12px] font-bold border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1.5 shadow-sm">
                        <Tag className="h-3 w-3" /> {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 opacity-0 group-hover:opacity-100 hover:text-indigo-900 dark:hover:text-indigo-200 transition-all">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    
                    {isAddingTag ? (
                      <input 
                        autoFocus
                        type="text" 
                        value={newTag} 
                        onChange={(e) => setNewTag(e.target.value)}
                        onBlur={() => { if (!newTag.trim()) setIsAddingTag(false); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addTag();
                          if (e.key === 'Escape') setIsAddingTag(false);
                        }}
                        className="w-24 px-2 py-1 border-2 border-[#6E3BFE] bg-white dark:bg-zinc-950 rounded-lg text-[12px] font-bold outline-none"
                      />
                    ) : (
                      <button onClick={() => setIsAddingTag(true)} className="px-3 py-1.5 border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 rounded-lg text-[12px] font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Add Tag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
