import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.ts";

export interface OrgRequest extends AuthenticatedRequest {
  orgId?: string;
  memberRole?: string;
}

export const requireOrgAccess = async (
  req: OrgRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.headers["x-org-id"] as string;

    if (!orgId) {
      return res.status(400).json({ error: "Missing x-org-id header" });
    }

    if (!req.supabase) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user is a member of this organization
    const { data: member, error } = await req.supabase
      .from("users")
      .select("organization_id, role_id, roles(name)")
      .eq("organization_id", orgId)
      .eq("id", req.user?.id)
      .single();

    if (error || !member) {
      return res.status(403).json({ error: "Forbidden: You don't have access to this organization." });
    }

    req.orgId = orgId;
    req.memberRole = (member.roles as any)?.name;
    
    next();
  } catch (error) {
    console.error("Org Context Middleware Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
