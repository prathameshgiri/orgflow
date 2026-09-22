import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

export interface AuthenticatedRequest extends Request {
  user?: any;
  organizationId?: string;
  supabase?: any;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase URL or Anon Key is missing in environment.");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Create a request-scoped client that passes the user's JWT
    // This ensures any DB calls using req.supabase will strictly enforce RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    req.user = user;
    req.supabase = supabase;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const requireOrgAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.headers['x-organization-id'] as string;
    
    if (!orgId) {
       return res.status(400).json({ error: "Missing x-organization-id header" });
    }
    
    if (!req.user || !req.supabase) {
       return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Check if user is member of organization using scoped client
    const { data: member, error } = await req.supabase
      .from('organization_members')
      .select('id, role_id')
      .eq('organization_id', orgId)
      .eq('user_id', req.user.id)
      .single();
      
    if (error || !member) {
       return res.status(403).json({ error: "Forbidden: Not a member of this organization" });
    }
    
    req.organizationId = orgId;
    next();
  } catch(error) {
     console.error("Org Access Middleware Error:", error);
     res.status(500).json({ error: "Internal server error during organization access check" });
  }
};
