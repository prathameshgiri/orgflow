import { Response } from "express";
import { supabase } from "../../shared/supabase.ts";
import { OrgRequest } from "../middleware/orgContext.ts";

export const getOrgDashboard = async (req: OrgRequest, res: Response) => {
  try {
    // Fetch basic org stats
    const orgId = req.orgId;

    const { count: memberCount, error: memberErr } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId);

    const { count: projectCount, error: projectErr } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId);
      
    // Handle error if projects table doesn't exist yet (we'll add it in Phase 3)
    const activeProjects = projectErr ? 0 : projectCount;

    res.json({
      stats: {
        totalMembers: memberCount || 0,
        activeProjects: activeProjects || 0,
        tasksPending: 0, // Placeholder
      },
      role: req.memberRole
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
