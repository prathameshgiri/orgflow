import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { OrgRequest } from "../middleware/orgContext.ts";

const getAuthSupabase = (req: OrgRequest) => {
  const token = req.headers.authorization?.split(" ")[1] || "";
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } } });
};

export const getOrgUsers = async (req: OrgRequest, res: Response) => {
  try {
    const supabase = getAuthSupabase(req);
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id, full_name, email, avatar_url, created_at,
        roles ( id, name, is_system_role )
      `)
      .eq("organization_id", req.orgId);

    if (error) throw error;
    
    // Format to match what the frontend Users.tsx expects
    const members = users?.map((u: any) => ({
      id: u.id,
      joined_at: u.created_at,
      users: {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        avatar_url: u.avatar_url
      },
      roles: u.roles
    })) || [];

    res.json({ members });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const inviteUser = async (req: OrgRequest, res: Response) => {
  try {
    if (['Member', 'Read Only'].includes(req.memberRole || '')) {
      return res.status(403).json({ error: "Forbidden: You do not have permission to invite users." });
    }

    const { email, roleId } = req.body;

    const supabase = getAuthSupabase(req);
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from("invitations")
      .insert({
        organization_id: req.orgId,
        email,
        role_id: roleId,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select("token")
      .single();

    if (error) throw error;

    res.json({ success: true, message: `Invite generated for ${email}`, token: data.token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req: OrgRequest, res: Response) => {
  try {
    if (['Member', 'Read Only'].includes(req.memberRole || '')) {
      return res.status(403).json({ error: "Forbidden: You do not have permission to update user roles." });
    }

    const supabase = getAuthSupabase(req);
    const { memberId } = req.params;
    const { roleId } = req.body;

    const { data: memberCheck } = await supabase
      .from("users")
      .select("id")
      .eq("id", memberId)
      .eq("organization_id", req.orgId)
      .single();

    if (!memberCheck) {
      return res.status(404).json({ error: "User not found in this organization" });
    }

    const { error } = await supabase
      .from("users")
      .update({ role_id: roleId })
      .eq("id", memberId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
