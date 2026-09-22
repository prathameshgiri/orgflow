import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { OrgRequest } from "../middleware/orgContext.ts";

const getAuthSupabase = (req: OrgRequest) => {
  const token = req.headers.authorization?.split(" ")[1] || "";
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } } });
};

export const getTeams = async (req: OrgRequest, res: Response) => {
  try {
    const supabase = getAuthSupabase(req);
    const { data: teams, error } = await supabase
      .from("teams")
      .select("*, team_members(user_id, users(full_name))")
      .eq("organization_id", req.orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(teams || []);
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createTeam = async (req: OrgRequest, res: Response) => {
  try {
    const { name, userIds } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const supabase = getAuthSupabase(req);
    
    // Insert team
    const { data: team, error } = await supabase
      .from("teams")
      .insert([
        {
          organization_id: req.orgId,
          name
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Log the activity
    const { error: logError } = await supabase
      .from("activity_logs")
      .insert([
        {
          organization_id: req.orgId,
          user_id: req.user?.id,
          resource: "teams",
          action: "created",
          details: { team_id: team.id, name, userIds }
        }
      ]);
      
    if (logError) {
      console.warn("Failed to log activity:", logError);
    }
    
    // Add users to team
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      const membersToInsert = userIds.map(uid => ({
        team_id: team.id,
        user_id: uid
      }));
      
      const { error: membersError } = await supabase
        .from("team_members")
        .insert(membersToInsert);
        
      if (membersError) {
        console.warn("Failed to add members:", membersError);
      }
    }

    res.status(201).json(team);
  } catch (error: any) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getTeamMembers = async (req: OrgRequest, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getAuthSupabase(req);
    
    const { data, error } = await supabase
      .from("team_members")
      .select("user_id, created_at, users(full_name, email, avatar_url)")
      .eq("team_id", id);
      
    // verify team belongs to org
    const { data: teamCheck } = await supabase
      .from("teams")
      .select("id")
      .eq("id", id)
      .eq("organization_id", req.orgId)
      .single();
      
    if (!teamCheck) {
       return res.status(404).json({ error: "Team not found" });
    }

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addTeamMember = async (req: OrgRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) return res.status(400).json({ error: "userId is required" });
    
    const supabase = getAuthSupabase(req);
    
    const { data: teamCheck } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", id)
      .eq("organization_id", req.orgId)
      .single();
      
    if (!teamCheck) return res.status(404).json({ error: "Team not found" });

    const { error } = await supabase
      .from("team_members")
      .insert({ team_id: id, user_id: userId });

    if (error) throw error;

    const { data: targetUser } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", userId)
      .single();
    
    await supabase.from("activity_logs").insert({
      organization_id: req.orgId,
      user_id: req.user?.id,
      resource: "teams",
      action: "member_added",
      details: { team_id: id, user_id: userId, target_user_name: targetUser?.full_name || "Unknown User", team_name: teamCheck.name }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeTeamMember = async (req: OrgRequest, res: Response) => {
  try {
    const { id, userId } = req.params;
    
    const supabase = getAuthSupabase(req);
    
    const { data: teamCheck } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", id)
      .eq("organization_id", req.orgId)
      .single();
      
    if (!teamCheck) return res.status(404).json({ error: "Team not found" });

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", id)
      .eq("user_id", userId);

    if (error) throw error;

    const { data: targetUser } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", userId)
      .single();

    await supabase.from("activity_logs").insert({
      organization_id: req.orgId,
      user_id: req.user?.id,
      resource: "teams",
      action: "member_removed",
      details: { team_id: id, user_id: userId, target_user_name: targetUser?.full_name || "Unknown User", team_name: teamCheck.name }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeamHistory = async (req: OrgRequest, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getAuthSupabase(req);
    
    const { data: teamCheck } = await supabase
      .from("teams")
      .select("id")
      .eq("id", id)
      .eq("organization_id", req.orgId)
      .single();
      
    if (!teamCheck) return res.status(404).json({ error: "Team not found" });

    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, action, details, occurred_at, users(full_name)")
      .eq("resource", "teams")
      .contains("details", { team_id: id })
      .eq("organization_id", req.orgId)
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
