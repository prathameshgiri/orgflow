export type EntityStatus = "active" | "inactive" | "trial" | "pending" | "suspended";

export interface Organization {
  id: string;
  name: string;
  email: string;
  adminName: string;
  userCount: number;
  teamCount: number;
  clientCount: number;
  status: EntityStatus;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roleId: string;
  teamId?: string;
  status: EntityStatus;
  lastActiveAt?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  status: EntityStatus;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  assignedTeamId?: string;
  assignedUserIds: string[];
  status: EntityStatus;
  notes?: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  category: "dashboard" | "users" | "teams" | "clients" | "roles" | "organization-settings" | "reports" | "activity-logs";
  action: "view" | "create" | "edit" | "delete" | "manage";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  isSystemRole: boolean;
}

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  roleId: string;
  teamId?: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expiresAt: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  occurredAt: string;
  ipAddress?: string;
  status: "success" | "failed";
}
