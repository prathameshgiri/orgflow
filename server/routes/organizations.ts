import { Request, Response } from "express";
import { supabase } from "../../shared/supabase.ts";
import { AuthenticatedRequest } from "../middleware/auth.ts";

export const getOrganizations = async (req: AuthenticatedRequest, res: Response) => {
  // Check if super admin
  const { data: userRecord } = await supabase
    .from("users")
    .select("is_super_admin")
    .eq("id", req.user?.id)
    .single();

  if (!userRecord?.is_super_admin) {
    return res.status(403).json({ error: "Forbidden: Requires Super Admin" });
  }

  const { data: orgs, error } = await supabase.from("organizations").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ organizations: orgs });
};

export const createOrganization = async (req: AuthenticatedRequest, res: Response) => {
  const { name, slug } = req.body;

  // Check if super admin (or allow any user to create org based on business logic)
  const { data: userRecord } = await supabase
    .from("users")
    .select("is_super_admin")
    .eq("id", req.user?.id)
    .single();

  if (!userRecord?.is_super_admin) {
    return res.status(403).json({ error: "Forbidden: Requires Super Admin" });
  }

  const { data, error } = await supabase
    .from("organizations")
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ organization: data });
};
