import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { OrgRequest } from "../middleware/orgContext.ts";

const getAuthSupabase = (req: OrgRequest) => {
  const token = req.headers.authorization?.split(" ")[1] || "";
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } } });
};

export const getIncidents = async (req: OrgRequest, res: Response) => {
  try {
    const supabase = getAuthSupabase(req);
    
    // First, determine if user is admin/owner
    const isAdmin = ['Admin', 'Owner'].includes(req.memberRole || '');
    
    // Construct the query
    let query = supabase
      .from("incidents")
      .select(`
        id, 
        title, 
        description, 
        status, 
        priority, 
        created_at,
        reporter:users!incidents_reporter_id_fkey(id, full_name, avatar_url, email),
        assignee:users!incidents_assignee_id_fkey(id, full_name, avatar_url, email),
        team:teams!incidents_team_id_fkey(id, name)
      `)
      .eq("organization_id", req.orgId)
      .order("created_at", { ascending: false });

    // If not admin, apply team/user filtering
    if (!isAdmin) {
      // Fetch user's teams
      const { data: userTeams } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", req.user?.id);
        
      const teamIds = userTeams?.map(t => t.team_id) || [];
      
      const orConditions = [
        `reporter_id.eq.${req.user?.id}`,
        `assignee_id.eq.${req.user?.id}`
      ];
      
      if (teamIds.length > 0) {
        orConditions.push(`team_id.in.(${teamIds.join(',')})`);
      }
      
      query = query.or(orConditions.join(','));
    }

    const { data: incidents, error } = await query;

    if (error) throw error;
    
    res.json({ incidents });
  } catch (error: any) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateIncident = async (req: OrgRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { priority, team_id, assignee_id, status, explanation } = req.body;
    
    if (!explanation) {
      return res.status(400).json({ error: "Explanation is required to update ticket" });
    }

    const supabase = getAuthSupabase(req);

    // Get current state to log changes
    const { data: currentIncident, error: fetchError } = await supabase
      .from("incidents")
      .select("*")
      .eq("id", id)
      .eq("organization_id", req.orgId)
      .single();

    if (fetchError || !currentIncident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    // Update incident
    const updateData: any = {};
    if (priority !== undefined) updateData.priority = priority;
    if (team_id !== undefined) updateData.team_id = team_id;
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id;
    if (status !== undefined) updateData.status = status;
    
    // Auto-status progression logic can go here (e.g., if assignee is set, change to in_progress)
    if (assignee_id && currentIncident.status === 'new' && !status) {
        updateData.status = 'in_progress';
    }

    const { error: updateError } = await supabase
      .from("incidents")
      .update(updateData)
      .eq("id", id);

    if (updateError) throw updateError;

    // Record activity log
    const { error: logError } = await supabase
      .from("activity_logs")
      .insert([
        {
          organization_id: req.orgId,
          user_id: req.user?.id,
          action: "update_incident",
          resource: id, // Using incident ID as the resource
          details: {
            explanation,
            changes: {
              priority: { from: currentIncident.priority, to: priority || currentIncident.priority },
              team_id: { from: currentIncident.team_id, to: team_id || currentIncident.team_id },
              assignee_id: { from: currentIncident.assignee_id, to: assignee_id || currentIncident.assignee_id },
              status: { from: currentIncident.status, to: status || updateData.status || currentIncident.status }
            }
          }
        }
      ]);

    if (logError) throw logError;

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating incident:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getIncidentHistory = async (req: OrgRequest, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getAuthSupabase(req);
    
    const { data: history, error } = await supabase
      .from("activity_logs")
      .select(`
        id,
        action,
        details,
        occurred_at,
        user:users!activity_logs_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq("organization_id", req.orgId)
      .eq("resource", id)
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    
    res.json({ history });
  } catch (error: any) {
    console.error("Error fetching incident history:", error);
    res.status(500).json({ error: error.message });
  }
};

export const addIncidentProgress = async (req: OrgRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { explanation, images } = req.body;
    
    if (!explanation && (!images || images.length === 0)) {
      return res.status(400).json({ error: "Explanation or image is required" });
    }

    const supabase = getAuthSupabase(req);
    
    // Verify incident exists and belongs to org
    const { data: incident, error: incError } = await supabase
      .from("incidents")
      .select("id")
      .eq("id", id)
      .eq("organization_id", req.orgId)
      .single();
      
    if (incError || !incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    const { error: logError } = await supabase
      .from("activity_logs")
      .insert([
        {
          organization_id: req.orgId,
          user_id: req.user?.id,
          resource: id,
          action: "progress_update",
          details: {
            explanation: explanation || "",
            images: images || []
          }
        }
      ]);

    if (logError) throw logError;

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error adding progress:", error);
    res.status(500).json({ error: error.message });
  }
};
