-- ==============================================================================
-- ORG MAN Multi-Tenant SaaS Database Schema
-- Designed for PostgreSQL / Supabase
-- ==============================================================================

-- ==========================================
-- 1. EXTENSIONS & ENUMS
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
DO $$ BEGIN
    CREATE TYPE entity_status AS ENUM ('active', 'inactive', 'trial', 'pending', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. CORE MULTI-TENANT TABLES
-- ==========================================

-- Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    admin_name TEXT,
    status entity_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS domain TEXT;

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Users Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role_id UUID, -- Will define FK later after roles table
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile_number TEXT,
    avatar_url TEXT,
    status entity_status DEFAULT 'active',
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status entity_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);


-- ==========================================
-- 3. ROLE-BASED ACCESS CONTROL (RBAC)
-- ==========================================

-- Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix up the foreign key in users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_role;
ALTER TABLE public.users 
ADD CONSTRAINT fk_users_role 
FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


-- Permissions Table (Global definitions, not org specific)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- e.g., 'users', 'projects'
    action TEXT NOT NULL,   -- e.g., 'create', 'view'
    description TEXT,
    UNIQUE (category, action)
);

-- Role Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);


-- ==========================================
-- 4. OPERATIONS (PHASE 1)
-- ==========================================

-- Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    status entity_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Planning' CHECK (status IN ('Planning', 'In Progress', 'On Hold', 'Completed', 'Maintenance', 'Cancelled', 'At Risk')),
    priority TEXT DEFAULT 'Medium',
    progress INTEGER DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Members (Many-to-Many for quick lookups)
CREATE TABLE IF NOT EXISTS public.project_members (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. AUDIT & INVITATIONS
-- ==========================================

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    token UUID NOT NULL DEFAULT uuid_generate_v4(),
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 6. AUTO-UPDATED TIMESTAMPS (TRIGGERS)
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orgs_updated_at ON public.organizations;
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helper function to get current user's organization_id securely
CREATE OR REPLACE FUNCTION current_user_org_id() 
RETURNS UUID AS $$
    SELECT organization_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- Organizations RLS
-- Users can see their own organization (or any organization they created)
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization" ON public.organizations
    FOR SELECT TO authenticated
    USING (
      id = current_user_org_id() 
      OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their own organization" ON public.organizations;
CREATE POLICY "Users can update their own organization" ON public.organizations
    FOR UPDATE TO authenticated
    USING (
      id = current_user_org_id() 
      OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
    FOR INSERT TO authenticated WITH CHECK (true);

-- ---------------------------------------------------------
-- Users RLS
-- Users can see their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Users can see all other users in their organization
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.users;
CREATE POLICY "Users can view members of their organization" ON public.users
    FOR SELECT TO authenticated
    USING (organization_id = current_user_org_id());

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

-- Only users can update their own profile initially
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------
-- Standard Tenant Isolation (Teams, Roles, Clients, Projects, Tasks, Logs)
-- Users can do ALL operations (CRUD) IF the record's organization_id matches theirs.
-- NOTE: In a true production app, you would add an extra AND clause to check user permissions via role_permissions.
-- For now, this strict tenant isolation guarantees no cross-tenant data leakage.

DROP POLICY IF EXISTS "Tenant Isolation: Teams" ON public.teams;
CREATE POLICY "Tenant Isolation: Teams" ON public.teams FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Roles" ON public.roles;
CREATE POLICY "Tenant Isolation: Roles" ON public.roles FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Clients" ON public.clients;
CREATE POLICY "Tenant Isolation: Clients" ON public.clients FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Projects" ON public.projects;
CREATE POLICY "Tenant Isolation: Projects" ON public.projects FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Tasks" ON public.tasks;
CREATE POLICY "Tenant Isolation: Tasks" ON public.tasks FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Activity Logs" ON public.activity_logs;
CREATE POLICY "Tenant Isolation: Activity Logs" ON public.activity_logs FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Invitations" ON public.invitations;
CREATE POLICY "Tenant Isolation: Invitations" ON public.invitations FOR ALL USING (organization_id = current_user_org_id());

-- ---------------------------------------------------------
-- Junction Tables (team_members, project_members, role_permissions)
-- We check access through the parent tables.

DROP POLICY IF EXISTS "Tenant Isolation: Team Members" ON public.team_members;
CREATE POLICY "Tenant Isolation: Team Members" ON public.team_members FOR ALL USING (team_id IN (SELECT id FROM public.teams WHERE organization_id = current_user_org_id()));

DROP POLICY IF EXISTS "Tenant Isolation: Project Members" ON public.project_members;
CREATE POLICY "Tenant Isolation: Project Members" ON public.project_members FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE organization_id = current_user_org_id()));

DROP POLICY IF EXISTS "Tenant Isolation: Role Permissions" ON public.role_permissions;
CREATE POLICY "Tenant Isolation: Role Permissions" ON public.role_permissions FOR ALL USING (role_id IN (SELECT id FROM public.roles WHERE organization_id = current_user_org_id()));

-- Permissions table is global, everyone can read.
DROP POLICY IF EXISTS "Global Read: Permissions" ON public.permissions;
CREATE POLICY "Global Read: Permissions" ON public.permissions FOR SELECT USING (true);


-- ==========================================
-- 8. AUTHENTICATION HOOKS
-- ==========================================
-- This trigger automatically creates a basic user profile when someone signs up via Supabase Auth
-- They are initialized without an organization. Organization assignment happens during onboarding.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_org_id UUID;
  v_role_id UUID;
  v_org_name TEXT;
  v_full_name TEXT;
  v_invite_token TEXT;
  v_inv RECORD;
BEGIN
  -- Extract metadata safely
  v_full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), 'New User');
  v_org_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'org_name'), '');
  v_invite_token := NULLIF(TRIM(NEW.raw_user_meta_data->>'invite_token'), '');

  -- 1. Check if user is signing up via an invite token
  IF v_invite_token IS NOT NULL THEN
    BEGIN
      SELECT * INTO v_inv 
      FROM public.invitations 
      WHERE token = v_invite_token::uuid 
        AND status = 'pending' 
        AND expires_at > NOW()
      LIMIT 1;

      IF v_inv.id IS NOT NULL THEN
        v_org_id := v_inv.organization_id;
        v_role_id := v_inv.role_id;
        
        UPDATE public.invitations 
        SET status = 'accepted' 
        WHERE id = v_inv.id;
      END IF;
    EXCEPTION WHEN others THEN
      v_inv := NULL;
    END;
  END IF;

  -- 2. If not an invited user, create organization and roles
  IF v_org_id IS NULL THEN
    IF v_org_name IS NULL THEN
      v_org_name := v_full_name || '''s Organization';
    END IF;

    v_org_id := gen_random_uuid();
    v_role_id := gen_random_uuid();

    -- Create Organization
    INSERT INTO public.organizations (id, name, email, admin_name)
    VALUES (v_org_id, v_org_name, NEW.email, v_full_name);

    -- Create 5 Default Roles directly
    INSERT INTO public.roles (id, organization_id, name, description, is_system_role)
    VALUES 
      (v_role_id, v_org_id, 'Superadmin', 'Full access to all settings and modules', true),
      (gen_random_uuid(), v_org_id, 'Administrator', 'Manage users, roles, and settings', true),
      (gen_random_uuid(), v_org_id, 'Manager', 'Manage projects, teams, and assignments', true),
      (gen_random_uuid(), v_org_id, 'Member', 'Standard user access', true),
      (gen_random_uuid(), v_org_id, 'Read Only', 'Can view all records but cannot make any changes', true);
  END IF;

  -- 3. Upsert user in public.users linked to organization and role
  INSERT INTO public.users (id, organization_id, role_id, full_name, email, mobile_number)
  VALUES (
    NEW.id, 
    v_org_id, 
    v_role_id, 
    v_full_name, 
    NEW.email, 
    NULLIF(TRIM(NEW.raw_user_meta_data->>'mobile_number'), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    organization_id = COALESCE(EXCLUDED.organization_id, public.users.organization_id),
    role_id = COALESCE(EXCLUDED.role_id, public.users.role_id),
    full_name = EXCLUDED.full_name,
    mobile_number = COALESCE(EXCLUDED.mobile_number, public.users.mobile_number);

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Fail-safe: ensure auth user is ALWAYS created and profile row exists
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  INSERT INTO public.users (id, full_name, email)
  VALUES (NEW.id, v_full_name, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_catalog;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RPC function to process invitations safely
DROP FUNCTION IF EXISTS public.accept_invitation(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.accept_invitation(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.accept_invitation(p_invite_token UUID)
RETURNS JSONB AS $$
DECLARE
  v_inv RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_inv
  FROM public.invitations
  WHERE token = p_invite_token AND status = 'pending' AND expires_at > NOW()
  LIMIT 1;

  IF v_inv.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation token');
  END IF;

  UPDATE public.users
  SET organization_id = v_inv.organization_id,
      role_id = v_inv.role_id
  WHERE id = v_user_id;

  UPDATE public.invitations
  SET status = 'accepted'
  WHERE id = v_inv.id;

  RETURN jsonb_build_object('success', true, 'organization_id', v_inv.organization_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_catalog;



-- ==========================================
-- END OF SCHEMA
-- ==========================================
-- ==============================================================================
-- ORG MAN Multi-Tenant SaaS Database Schema (EXPANSION PACK)
-- Adds Service Management, Knowledge, Assets, and Automation modules
-- ==============================================================================

-- Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 1. SERVICE MANAGEMENT
-- ==========================================

DO $$ BEGIN
    CREATE TYPE incident_priority AS ENUM ('p1_critical', 'p2_high', 'p3_medium', 'p4_low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('new', 'in_progress', 'on_hold', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Incidents (Break/Fix)
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority incident_priority DEFAULT 'p3_medium',
    status ticket_status DEFAULT 'new',
    ticket_type TEXT DEFAULT 'incident',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_incidents_updated_at ON public.incidents;
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Service Catalog Categories
CREATE TABLE IF NOT EXISTS public.catalog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT
);

-- Service Catalog Items (e.g., "Request a Laptop")
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.catalog_categories(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true
);

-- Service Requests (Fulfillment)
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    details TEXT,
    status ticket_status DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_requests_updated_at ON public.service_requests;
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Problems (Root Cause Analysis for multiple incidents)
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    root_cause TEXT,
    workaround TEXT,
    status ticket_status DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_problems_updated_at ON public.problems;
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON public.problems FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Changes (Change Advisory Board)
CREATE TABLE IF NOT EXISTS public.changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    risk_level TEXT,
    planned_start TIMESTAMP WITH TIME ZONE,
    planned_end TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_changes_updated_at ON public.changes;
CREATE TRIGGER update_changes_updated_at BEFORE UPDATE ON public.changes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Approvals (For requests and changes)
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'change' or 'request'
    target_id UUID NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. KNOWLEDGE BASE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.article_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.knowledge_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.article_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT,
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_articles_updated_at ON public.knowledge_articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.knowledge_articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 3. ASSETS & CMDB (Configuration Management)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    asset_tag TEXT,
    serial_number TEXT,
    model TEXT,
    status TEXT DEFAULT 'in_use',
    purchase_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Configuration Items (Servers, Databases, Network Gear)
CREATE TABLE IF NOT EXISTS public.configuration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ci_type TEXT, -- e.g., 'Server', 'Database'
    ip_address TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_ci_updated_at ON public.configuration_items;
CREATE TRIGGER update_ci_updated_at BEFORE UPDATE ON public.configuration_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ==========================================
-- 4. AUTOMATION & WORKFLOWS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT, -- e.g., 'incident_created', 'request_approved'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    condition_json JSONB,
    action_type TEXT, -- e.g., 'send_email', 'update_status'
    action_payload JSONB,
    step_order INTEGER DEFAULT 0
);


-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- IMPORTANT: This assumes the `current_user_org_id()` function exists from the first schema file.

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;


-- Apply Standard Tenant Isolation to all new tables
DROP POLICY IF EXISTS "Tenant Isolation: Incidents" ON public.incidents;
CREATE POLICY "Tenant Isolation: Incidents" ON public.incidents FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Catalog Categories" ON public.catalog_categories;
CREATE POLICY "Tenant Isolation: Catalog Categories" ON public.catalog_categories FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Catalog Items" ON public.catalog_items;
CREATE POLICY "Tenant Isolation: Catalog Items" ON public.catalog_items FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Service Requests" ON public.service_requests;
CREATE POLICY "Tenant Isolation: Service Requests" ON public.service_requests FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Problems" ON public.problems;
CREATE POLICY "Tenant Isolation: Problems" ON public.problems FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Changes" ON public.changes;
CREATE POLICY "Tenant Isolation: Changes" ON public.changes FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Approvals" ON public.approvals;
CREATE POLICY "Tenant Isolation: Approvals" ON public.approvals FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Article Categories" ON public.article_categories;
CREATE POLICY "Tenant Isolation: Article Categories" ON public.article_categories FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Knowledge Articles" ON public.knowledge_articles;
CREATE POLICY "Tenant Isolation: Knowledge Articles" ON public.knowledge_articles FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Assets" ON public.assets;
CREATE POLICY "Tenant Isolation: Assets" ON public.assets FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Configuration Items" ON public.configuration_items;
CREATE POLICY "Tenant Isolation: Configuration Items" ON public.configuration_items FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Workflows" ON public.workflows;
CREATE POLICY "Tenant Isolation: Workflows" ON public.workflows FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Automation Rules" ON public.automation_rules;
CREATE POLICY "Tenant Isolation: Automation Rules" ON public.automation_rules FOR ALL USING (organization_id = current_user_org_id());

-- ==========================================
-- END OF EXPANSION SCHEMA
-- ==========================================

-- ==========================================
-- RLS POLICIES FOR OPERATIONS
-- ==========================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read/write for org users on teams" ON public.teams;
CREATE POLICY "Enable read/write for org users on teams" ON public.teams
    FOR ALL USING (organization_id = current_user_org_id());

DROP POLICY IF EXISTS "Enable read/write for org users on projects" ON public.projects;
CREATE POLICY "Enable read/write for org users on projects" ON public.projects
    FOR ALL USING (organization_id = current_user_org_id());

DROP POLICY IF EXISTS "Enable read/write for org users on tasks" ON public.tasks;
CREATE POLICY "Enable read/write for org users on tasks" ON public.tasks
    FOR ALL USING (organization_id = current_user_org_id());
-- Phase 2 & 3: Advanced ITSM Permissions

INSERT INTO public.permissions (category, action, description) VALUES
-- Incident Management
('incidents', 'view', 'View incidents'),
('incidents', 'create', 'Create incidents'),
('incidents', 'update', 'Update incidents'),
('incidents', 'delete', 'Delete incidents'),
('incidents', 'assign', 'Assign incidents to users or teams'),

-- Service Requests
('requests', 'view', 'View service requests'),
('requests', 'create', 'Create service requests'),
('requests', 'update', 'Update service requests'),
('requests', 'delete', 'Delete service requests'),
('catalog', 'manage', 'Manage service catalog items and categories'),

-- Problem Management
('problems', 'view', 'View problems'),
('problems', 'create', 'Create problems'),
('problems', 'update', 'Update problems'),
('problems', 'delete', 'Delete problems'),

-- Change Management
('changes', 'view', 'View changes'),
('changes', 'create', 'Create changes'),
('changes', 'update', 'Update changes'),
('changes', 'approve', 'Approve changes'),

-- Project & Task Management
('projects', 'view', 'View projects'),
('projects', 'manage', 'Create, update, and manage projects'),
('tasks', 'view', 'View tasks'),
('tasks', 'manage', 'Manage tasks'),

-- Asset & Configuration Management
('assets', 'view', 'View assets and configuration items'),
('assets', 'manage', 'Create, update, and delete assets'),

-- Knowledge Base
('knowledge', 'view', 'View knowledge base articles'),
('knowledge', 'manage', 'Create, publish, and manage knowledge articles'),

-- Administration & Platform Rules
('workflows', 'manage', 'Manage organizational workflows and automations'),
('sla', 'manage', 'Configure SLA policies and rules'),
('reports', 'view', 'View analytics and reports')
ON CONFLICT (category, action) DO NOTHING;
-- Run this script in your Supabase SQL Editor to fix the permission denied errors

-- 1. Grant usage on the public schema to essential roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant all privileges on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;


-- Configuration Items (Servers, Databases, Network Gear)
CREATE TABLE IF NOT EXISTS public.configuration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ci_type TEXT, -- e.g., 'Server', 'Database'
    ip_address TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DROP TRIGGER IF EXISTS update_ci_updated_at ON public.configuration_items;
CREATE TRIGGER update_ci_updated_at BEFORE UPDATE ON public.configuration_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ==========================================
-- 4. AUTOMATION & WORKFLOWS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT, -- e.g., 'incident_created', 'request_approved'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    condition_json JSONB,
    action_type TEXT, -- e.g., 'send_email', 'update_status'
    action_payload JSONB,
    step_order INTEGER DEFAULT 0
);


-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- IMPORTANT: This assumes the `current_user_org_id()` function exists from the first schema file.

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;


-- Apply Standard Tenant Isolation to all new tables
DROP POLICY IF EXISTS "Tenant Isolation: Incidents" ON public.incidents;
CREATE POLICY "Tenant Isolation: Incidents" ON public.incidents FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Catalog Categories" ON public.catalog_categories;
CREATE POLICY "Tenant Isolation: Catalog Categories" ON public.catalog_categories FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Catalog Items" ON public.catalog_items;
CREATE POLICY "Tenant Isolation: Catalog Items" ON public.catalog_items FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Service Requests" ON public.service_requests;
CREATE POLICY "Tenant Isolation: Service Requests" ON public.service_requests FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Problems" ON public.problems;
CREATE POLICY "Tenant Isolation: Problems" ON public.problems FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Changes" ON public.changes;
CREATE POLICY "Tenant Isolation: Changes" ON public.changes FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Approvals" ON public.approvals;
CREATE POLICY "Tenant Isolation: Approvals" ON public.approvals FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Article Categories" ON public.article_categories;
CREATE POLICY "Tenant Isolation: Article Categories" ON public.article_categories FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Knowledge Articles" ON public.knowledge_articles;
CREATE POLICY "Tenant Isolation: Knowledge Articles" ON public.knowledge_articles FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Assets" ON public.assets;
CREATE POLICY "Tenant Isolation: Assets" ON public.assets FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Configuration Items" ON public.configuration_items;
CREATE POLICY "Tenant Isolation: Configuration Items" ON public.configuration_items FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Workflows" ON public.workflows;
CREATE POLICY "Tenant Isolation: Workflows" ON public.workflows FOR ALL USING (organization_id = current_user_org_id());
DROP POLICY IF EXISTS "Tenant Isolation: Automation Rules" ON public.automation_rules;
CREATE POLICY "Tenant Isolation: Automation Rules" ON public.automation_rules FOR ALL USING (organization_id = current_user_org_id());

-- ==========================================
-- END OF EXPANSION SCHEMA
-- ==========================================

-- ==========================================
-- RLS POLICIES FOR OPERATIONS
-- ==========================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read/write for org users on teams" ON public.teams;
CREATE POLICY "Enable read/write for org users on teams" ON public.teams
    FOR ALL USING (organization_id = current_user_org_id());

DROP POLICY IF EXISTS "Enable read/write for org users on projects" ON public.projects;
CREATE POLICY "Enable read/write for org users on projects" ON public.projects
    FOR ALL USING (organization_id = current_user_org_id());

DROP POLICY IF EXISTS "Enable read/write for org users on tasks" ON public.tasks;
CREATE POLICY "Enable read/write for org users on tasks" ON public.tasks
    FOR ALL USING (organization_id = current_user_org_id());
-- Phase 2 & 3: Advanced ITSM Permissions

INSERT INTO public.permissions (category, action, description) VALUES
-- Incident Management
('incidents', 'view', 'View incidents'),
('incidents', 'create', 'Create incidents'),
('incidents', 'update', 'Update incidents'),
('incidents', 'delete', 'Delete incidents'),
('incidents', 'assign', 'Assign incidents to users or teams'),

-- Service Requests
('requests', 'view', 'View service requests'),
('requests', 'create', 'Create service requests'),
('requests', 'update', 'Update service requests'),
('requests', 'delete', 'Delete service requests'),
('catalog', 'manage', 'Manage service catalog items and categories'),

-- Problem Management
('problems', 'view', 'View problems'),
('problems', 'create', 'Create problems'),
('problems', 'update', 'Update problems'),
('problems', 'delete', 'Delete problems'),

-- Change Management
('changes', 'view', 'View changes'),
('changes', 'create', 'Create changes'),
('changes', 'update', 'Update changes'),
('changes', 'approve', 'Approve changes'),

-- Project & Task Management
('projects', 'view', 'View projects'),
('projects', 'manage', 'Create, update, and manage projects'),
('tasks', 'view', 'View tasks'),
('tasks', 'manage', 'Manage tasks'),

-- Asset & Configuration Management
('assets', 'view', 'View assets and configuration items'),
('assets', 'manage', 'Create, update, and delete assets'),

-- Knowledge Base
('knowledge', 'view', 'View knowledge base articles'),
('knowledge', 'manage', 'Create, publish, and manage knowledge articles'),

-- Administration & Platform Rules
('workflows', 'manage', 'Manage organizational workflows and automations'),
('sla', 'manage', 'Configure SLA policies and rules'),
('reports', 'view', 'View analytics and reports')
ON CONFLICT (category, action) DO NOTHING;
-- Run this script in your Supabase SQL Editor to fix the permission denied errors

-- 1. Grant usage on the public schema to essential roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant all privileges on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Grant all privileges on all sequences in the public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Ensure future tables also inherit these default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON SEQUENCES TO anon, authenticated, service_role;

-- 5. Sync any existing auth.users to public.users (in case users signed up before the trigger was created)
INSERT INTO public.users (id, full_name, email)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'My User'), email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- 6. Trigger to automatically create default roles when a new organization is created
CREATE OR REPLACE FUNCTION public.create_default_roles_for_org()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.roles (id, organization_id, name, description, is_system_role) VALUES
  (gen_random_uuid(), NEW.id, 'Superadmin', 'Full access to all settings and modules', true),
  (gen_random_uuid(), NEW.id, 'Administrator', 'Manage users, roles, and settings', true),
  (gen_random_uuid(), NEW.id, 'Manager', 'Manage projects, teams, and assignments', true),
  (gen_random_uuid(), NEW.id, 'Member', 'Standard user access', true),
  (gen_random_uuid(), NEW.id, 'Read Only', 'Can view all records but cannot make any changes', true)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_catalog;

DROP TRIGGER IF EXISTS on_org_created ON public.organizations;
CREATE TRIGGER on_org_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_roles_for_org();

-- 7. Backfill default roles for any existing organizations that don't have them
INSERT INTO public.roles (organization_id, name, description, is_system_role)
SELECT id, 'Superadmin', 'Full access to all settings and modules', true
FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM public.roles WHERE name = 'Superadmin');

INSERT INTO public.roles (organization_id, name, description, is_system_role)
SELECT id, 'Administrator', 'Manage users, roles, and settings', true
FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM public.roles WHERE name = 'Administrator');

INSERT INTO public.roles (organization_id, name, description, is_system_role)
SELECT id, 'Manager', 'Manage projects, teams, and assignments', true
FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM public.roles WHERE name = 'Manager');

INSERT INTO public.roles (organization_id, name, description, is_system_role)
SELECT id, 'Member', 'Standard user access', true
FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM public.roles WHERE name = 'Member');

INSERT INTO public.roles (organization_id, name, description, is_system_role)
SELECT id, 'Read Only', 'Can view all records but cannot make any changes', true
FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM public.roles WHERE name = 'Read Only');

-- ==========================================
-- MANUAL MIGRATION TO DROP DEPARTMENTS (run if updating an existing DB)
-- ==========================================
-- ALTER TABLE IF EXISTS public.teams DROP COLUMN IF EXISTS department_id;
-- DROP TABLE IF EXISTS public.departments CASCADE;
-- Append team_id column to incidents table for Service Desk Team Assignments
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
-- Append team_id column to service_requests table for Team Assignments
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
-- Append team_id column to tasks table for Team Assignments
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
-- Append team_id column to catalog_items table for Team Assignments
ALTER TABLE public.catalog_items ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
-- Append team_id column to problems table for Team Assignments
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
-- Append team_id column to changes table for Team Assignments
ALTER TABLE public.changes ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- ==========================================
-- PROJECT TASKS (Kanban Board)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    sub_tasks JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist in case the table was already created
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS sub_tasks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- RLS for project_tasks
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view project tasks in their organization" ON public.project_tasks;
CREATE POLICY "Users can view project tasks in their organization"
    ON public.project_tasks FOR SELECT
    USING (organization_id = (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create project tasks in their organization" ON public.project_tasks;
CREATE POLICY "Users can create project tasks in their organization"
    ON public.project_tasks FOR INSERT
    WITH CHECK (organization_id = (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update project tasks in their organization" ON public.project_tasks;
CREATE POLICY "Users can update project tasks in their organization"
    ON public.project_tasks FOR UPDATE
    USING (organization_id = (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete project tasks in their organization" ON public.project_tasks;
CREATE POLICY "Users can delete project tasks in their organization"
    ON public.project_tasks FOR DELETE
    USING (organization_id = (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));
