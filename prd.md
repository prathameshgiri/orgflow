You are a Senior Software Architect, Senior UI/UX Designer, Senior Full Stack Developer, SaaS Product Designer, Database Architect and Security Engineer.

Your task is to completely rebuild and improve my existing project into a production-ready SaaS platform.

PROJECT NAME

ORG MAN

IMPORTANT

I already have an old frontend UI.

Do NOT keep it as-is.

Analyze it only as a reference.

You are allowed to completely redesign the UI, architecture, routing, components, pages, database structure and backend if a better approach exists.

The final application should feel like a modern SaaS product similar to:

• Notion
• ClickUp
• Slack
• Jira
• Asana
• Monday.com
• Linear

I want a clean, scalable, enterprise-ready architecture.

====================================================

PROJECT IDEA

ORG MAN is a Multi-Tenant Organization Management & Collaboration Platform.

Multiple organizations can register on the same platform.

Every organization gets its own isolated workspace.

Each organization manages:

• Users
• Teams
• Departments
• Clients
• Projects
• Tasks
• Documents
• Roles
• Permissions
• Invitations
• Internal Announcements
• Activity Logs
• Organization Settings

No organization should ever access another organization's data.

====================================================

TECH STACK

Frontend

React
TypeScript
TailwindCSS
React Router
React Query
Zustand
React Hook Form
Zod

Backend

Node.js
Express
TypeScript

Database

Supabase PostgreSQL

Authentication

Supabase Auth

Authorization

Role Based Access Control

Row Level Security

Deployment

Frontend → Netlify

Backend → Netlify Functions compatible

Database → Supabase

DO NOT USE

MongoDB

Firebase

MySQL

PHP

====================================================

MULTI TENANT ARCHITECTURE

Every record belongs to exactly one organization.

Use organization_id everywhere required.

No cross organization access.

Use Row Level Security.

Use middleware to verify:

Current user

Current organization

Membership

Role

Permissions

====================================================

ROLES

Platform Super Admin

Organization Owner

Organization Admin

Manager

Team Lead

Member

Client

Allow custom roles.

====================================================

PERMISSION SYSTEM

Permissions should be granular.

Examples

users.view

users.create

users.edit

users.delete

teams.view

teams.manage

clients.manage

projects.manage

tasks.manage

roles.manage

settings.manage

billing.manage

documents.manage

reports.view

dashboard.view

Admin should be able to create custom permissions later.

====================================================

SUPER ADMIN PANEL

Global dashboard

Organizations

Users

Projects

Tasks

Clients

Teams

Subscriptions

Platform Settings

Security

Audit Logs

Reports

Analytics

System Health

Database Status

Platform Activity

Ability to:

Create organizations

Suspend organizations

Delete organizations

View organization

Login as organization admin

Manage users

Reset organization

Manage plans

Manage feature flags

====================================================

ORGANIZATION DASHBOARD

Dashboard

Projects

Tasks

Teams

Departments

Clients

Calendar

Announcements

Documents

Files

Chat

Reports

Activity

Settings

====================================================

USER MANAGEMENT

Invite users

Create users

Deactivate users

Delete users

Reset password

Assign role

Assign department

Assign team

Assign projects

Assign permissions

Bulk actions

Search

Filters

Pagination

====================================================

TEAM MANAGEMENT

Create team

Update team

Delete team

Assign leader

Assign members

Move members

Archive teams

====================================================

DEPARTMENTS

Engineering

Marketing

Sales

HR

Finance

Custom Departments

====================================================

CLIENT MANAGEMENT

Create clients

Assign managers

Assign teams

Assign projects

Documents

Notes

Activity

====================================================

PROJECT MANAGEMENT

Create Project

Project Status

Timeline

Priority

Milestones

Members

Client

Files

Activity

Comments

====================================================

TASK MANAGEMENT

Kanban Board

List View

Calendar View

Priority

Due Date

Assignee

Status

Comments

Attachments

====================================================

DOCUMENTS

Folders

Permissions

Preview

Upload

Versioning

Activity

====================================================

ANNOUNCEMENTS

Organization announcements

Department announcements

Pinned announcements

Scheduled announcements

====================================================

CHAT

Internal Team Chat

Organization Chat

Project Chat

Direct Messages

Typing indicators

Online users

====================================================

NOTIFICATIONS

Real-time notifications

Email notifications

Unread count

Notification center

====================================================

REPORTS

User report

Project report

Client report

Task report

Organization report

Activity report

====================================================

AUDIT LOGS

Every important action should be logged.

Login

Logout

Create

Delete

Update

Permission changes

Role changes

Invitation accepted

Project changes

====================================================

DATABASE

Design a scalable PostgreSQL schema.

Normalize tables.

Create indexes.

Foreign keys.

Constraints.

Migration files.

Seed files.

====================================================

API

REST API

Versioned

/api/v1/

Use proper controllers.

Services.

Repositories.

Validation.

Middlewares.

DTOs.

====================================================

VALIDATION

Use Zod or equivalent.

Proper validation everywhere.

====================================================

SECURITY

Helmet

Rate Limit

CORS

JWT validation

Secure Cookies where applicable

Environment Variables

Input Sanitization

SQL Injection protection

XSS protection

CSRF strategy

====================================================

UI

Modern SaaS Dashboard

Beautiful animations

Dark Mode

Light Mode

Responsive

Professional

Smooth transitions

Sidebar

Command Palette

Quick Search

Breadcrumbs

Reusable Components

Empty States

Loading Skeletons

Error Pages

Success States

Toast Notifications

====================================================

DESIGN SYSTEM

Buttons

Cards

Tables

Inputs

Dropdowns

Dialogs

Drawers

Badges

Tabs

Avatar

Charts

Calendar

Kanban

====================================================

CODE QUALITY

Use clean architecture.

SOLID principles.

Reusable hooks.

Reusable components.

Proper folder structure.

Feature based architecture.

No duplicated code.

====================================================

PERFORMANCE

Lazy loading

Code splitting

Pagination

Infinite scroll where useful

Debounced search

Caching

Memoization

Optimized queries

====================================================

DELIVERABLES

Generate everything required for a production-ready SaaS application.

Include:

Complete frontend

Complete backend

Supabase schema

RLS policies

Migrations

Seed data

API documentation

Folder structure

Deployment guide

Netlify configuration

Environment variables

README

Future scalability suggestions

====================================================

FINAL GOAL

I want ORG MAN to look and feel like a premium enterprise SaaS platform that can support thousands of organizations with secure multi-tenancy, role-based access control, collaboration, project management and organization administration.




# ORG MAN — ENTERPRISE MULTI-TENANT WORKSPACE + ITSM PLATFORM

Transform the existing project into a production-ready enterprise SaaS platform called:

# ORG MAN

ORG MAN should combine:

1. Multi-tenant Organization Management
2. User / Role / Permission Management
3. Project & Task Management
4. Service Management
5. ITSM capabilities inspired by enterprise platforms such as ServiceNow
6. Configurable workflows
7. Configurable SLA and priority rules
8. Approval management
9. Incident / Request / Problem / Change management
10. Knowledge management
11. Asset / Configuration management
12. Notifications and automation
13. Complete audit history

IMPORTANT:

ORG MAN should NOT be a copy of ServiceNow's UI or proprietary implementation.

Use ServiceNow-style enterprise concepts as inspiration, but build an original product, architecture, naming system, UI and implementation.

---

# 1. CORE PRODUCT CONCEPT

ORG MAN is a centralized digital workspace where every organization can configure and manage its own operations.

Example organizations:

* Company A
* College B
* NGO C
* Startup D
* IT Service Company E

Each organization gets its own isolated workspace.

Every organization can independently configure:

* users
* teams
* departments
* roles
* permissions
* services
* service catalog
* incidents
* service requests
* problems
* changes
* approvals
* SLAs
* priorities
* categories
* assignment rules
* escalation rules
* workflows
* notifications
* knowledge base
* assets
* configuration items
* projects
* tasks
* documents
* reports
* dashboards

The platform Super Admin manages the entire ORG MAN platform.

---

# 2. MOST IMPORTANT FEATURE:

# ORGANIZATION-CONTROLLED RULE ENGINE

Do NOT hardcode business rules globally.

Each organization must be able to configure its own rules.

Example:

Organization A may define:

```text
P1 Critical
Response: 15 minutes
Resolution: 2 hours
```

Organization B may define:

```text
P1 Critical
Response: 30 minutes
Resolution: 4 hours
```

Both organizations can use different rules.

The system must therefore support organization-level configuration.

---

# 3. CONFIGURATION CENTER

Create a dedicated:

# Organization Configuration Center

The organization owner/admin can configure:

### General

* organization name
* logo
* timezone
* working hours
* holidays
* business days
* default language
* date/time format

### ITSM Configuration

* incident rules
* service request rules
* problem rules
* change rules
* SLA rules
* priority rules
* severity rules
* impact rules
* urgency rules
* escalation rules
* approval rules
* assignment rules
* notification rules

### Workflow Configuration

Allow organizations to create workflows.

Example:

```text
Incident Created
        ↓
Categorize
        ↓
Set Priority
        ↓
Assign Group
        ↓
Assign Engineer
        ↓
Investigate
        ↓
Resolve
        ↓
User Confirmation
        ↓
Close
```

The organization should be able to modify this workflow.

---

# 4. DEDICATED MODULE WINDOWS

Every major feature must have its own dedicated workspace/window.

Do NOT put everything into one dashboard.

Create separate application sections.

Recommended main navigation:

```text
Dashboard

My Workspace

Service Management
    Service Desk
    Incidents
    Service Requests
    Service Catalog
    Problems
    Changes
    Approvals
    SLAs

Operations
    Projects
    Tasks
    Teams
    Departments

Knowledge
    Knowledge Base
    Articles

Assets
    Assets
    Configuration Items
    Locations

Communication
    Announcements
    Notifications
    Chat

Reports
    Reports
    Analytics
    Dashboards

Administration
    Users
    Roles
    Permissions
    Organizations
    Workflows
    Automation
    Configuration
    Audit Logs
```

Each module should have:

* dedicated page
* dedicated routes
* dedicated components
* dedicated API endpoints
* dedicated permissions
* dedicated database tables where required

---

# 5. SERVICE DESK WORKSPACE

Create a dedicated:

# Service Desk

This should be the central IT/service management workspace.

Display:

* Open incidents
* Critical incidents
* Pending requests
* SLA breaches
* Approvals pending
* Assigned tickets
* Unassigned tickets
* Recently updated tickets
* Major incidents
* Problems
* Changes

Provide:

* search
* filters
* sorting
* saved views
* advanced filtering
* pagination

---

# 6. INCIDENT MANAGEMENT

Create a complete Incident Management module.

Incident fields:

```text
Incident Number
Title
Description
Caller
Organization
Service
Category
Subcategory
Impact
Urgency
Priority
Status
Assignment Group
Assigned To
Source
SLA
Due Date
Created By
Created At
Updated At
Resolved At
Closed At
Resolution
```

Statuses:

```text
New
Assigned
In Progress
Pending
Resolved
Closed
Cancelled
```

Organizations must be able to customize statuses.

---

# 7. INCIDENT PRIORITY ENGINE

Do NOT hardcode priority.

Allow organizations to configure:

```text
Impact
Urgency
Priority
```

Example:

```text
Impact + Urgency → Priority
```

Organization can create its own priority matrix.

Example:

```text
High Impact + High Urgency = P1
High Impact + Medium Urgency = P2
Medium Impact + Medium Urgency = P3
Low Impact + Low Urgency = P4
```

Another organization may define a completely different matrix.

The system must support this.

---

# 8. INCIDENT SLA ENGINE

Organizations must be able to configure SLA policies.

Example:

```text
P1
Response: 15 minutes
Resolution: 2 hours

P2
Response: 30 minutes
Resolution: 4 hours

P3
Response: 2 hours
Resolution: 8 hours

P4
Response: 8 hours
Resolution: 2 business days
```

Allow configuration of:

* response SLA
* resolution SLA
* business hours
* holidays
* pause conditions
* escalation time
* breach actions

Display:

* SLA timer
* remaining time
* elapsed time
* breached status
* warning status

---

# 9. SERVICE REQUEST MANAGEMENT

Create a separate:

# Service Requests

Examples:

* Access Request
* Software Installation
* New Laptop
* Password Reset
* VPN Access
* Email Access
* New Employee Account
* Application Access

Each organization can create its own request types.

Request fields should be configurable.

---

# 10. SERVICE CATALOG

Create:

# Service Catalog

Organization administrators can create catalog items.

Example:

```text
Request New Laptop
Request VPN Access
Request Software Installation
Request New Employee
Request Application Access
Request Email Account
```

Each catalog item can have:

* name
* description
* icon
* category
* fields
* approval requirements
* SLA
* assignment group
* workflow
* automation
* availability rules

Users can open a request from the catalog.

---

# 11. FORM BUILDER

Create a configurable form builder.

Organization admins should be able to create custom fields.

Supported field types:

```text
Text
Textarea
Number
Email
Phone
Date
DateTime
Dropdown
Multi Select
Checkbox
Radio
File Upload
User Selector
Team Selector
Department Selector
Reference Selector
```

Example:

An organization creates:

```text
Laptop Request

Employee Name
Department
Laptop Type
Operating System
Reason
Manager Approval
```

No developer should need to modify code for normal custom forms.

---

# 12. PROBLEM MANAGEMENT

Create:

# Problem Management

Problem fields:

```text
Problem Number
Title
Description
Related Incidents
Root Cause
Impact
Status
Assigned Group
Assigned To
Workaround
Permanent Fix
Known Error
Resolution
```

Statuses:

```text
New
Investigation
Root Cause Identified
Fix Planned
Resolved
Closed
```

Organizations can customize this.

Allow linking:

```text
Problem
    ↓
Multiple Incidents
    ↓
Change
    ↓
Resolution
```

---

# 13. CHANGE MANAGEMENT

Create:

# Change Management

Support:

```text
Normal Change
Standard Change
Emergency Change
Expedited Change
```

Organizations must be able to configure their own change types.

Change fields:

```text
Change Number
Title
Description
Reason
Risk
Impact
Urgency
Priority
Change Type
Assignment Group
Assigned To
Planned Start
Planned End
Implementation Plan
Backout Plan
Test Plan
Approval
Status
```

---

# 14. CHANGE WORKFLOW

Example:

```text
Draft
 ↓
Assessment
 ↓
Approval
 ↓
Scheduled
 ↓
Implementation
 ↓
Validation
 ↓
Completed
 ↓
Closed
```

Organization admins can customize this workflow.

---

# 15. CHANGE APPROVAL SYSTEM

Organizations can define approval rules.

Example:

```text
P1 Change
→ Manager Approval
→ CAB Approval
→ Implementation
```

Another organization:

```text
Low Risk Change
→ Team Lead Approval
→ Implementation
```

Support:

* single approver
* multiple approvers
* sequential approval
* parallel approval
* role-based approval
* team-based approval
* manager approval
* custom approval rules

---

# 16. CAB MANAGEMENT

Create:

# Change Advisory Board

Allow organizations to configure:

* CAB members
* CAB schedule
* CAB meeting
* approval rules
* change review
* change calendar

CAB should have its own workspace.

---

# 17. WORKFLOW ENGINE

This is a major feature.

Create a reusable workflow engine.

Organizations should be able to create:

```text
Trigger
 ↓
Condition
 ↓
Action
 ↓
Approval
 ↓
Notification
 ↓
Assignment
 ↓
Status Change
```

Example:

```text
WHEN
Incident priority = P1

THEN
Assign to Network Team
AND
Notify Manager
AND
Start P1 SLA
AND
Create escalation
```

Another example:

```text
WHEN
Service Request = Laptop

THEN
Manager Approval
→ IT Approval
→ Asset Assignment
→ User Notification
```

---

# 18. AUTOMATION ENGINE

Create organization-level automation rules.

Triggers:

```text
Record Created
Record Updated
Priority Changed
Status Changed
SLA Near Breach
SLA Breached
Approval Completed
Due Date Reached
```

Actions:

```text
Assign User
Assign Team
Change Status
Change Priority
Send Notification
Create Task
Create Approval
Start Workflow
Escalate
Add Comment
```

---

# 19. ESCALATION ENGINE

Organizations should define escalation rules.

Example:

```text
P1 SLA reaches 75%
→ Notify Assigned Engineer

P1 SLA reaches 90%
→ Notify Manager

P1 SLA breached
→ Notify Department Head
```

Rules must be organization-specific.

---

# 20. KNOWLEDGE MANAGEMENT

Create:

# Knowledge Base

Support:

* categories
* articles
* tags
* search
* drafts
* published articles
* archived articles
* article approval
* version history

Users should be able to search knowledge articles while creating incidents/requests.

---

# 21. ASSET MANAGEMENT

Create:

# Asset Management

Support:

```text
Laptop
Desktop
Server
Mobile
Printer
Network Device
Software License
Other
```

Fields:

```text
Asset ID
Name
Type
Serial Number
Status
Assigned User
Department
Location
Purchase Date
Warranty
Vendor
```

---

# 22. CONFIGURATION MANAGEMENT

Create:

# Configuration Management Database

Support:

```text
Configuration Items
```

Examples:

```text
Server
Application
Database
Network Device
Firewall
Laptop
Service
Cloud Resource
```

Relationships:

```text
Application
 ↓
Server
 ↓
Database
```

and:

```text
Service
 ↓
Application
 ↓
Infrastructure
```

Every organization controls its own configuration items.

---

# 23. PROJECT MANAGEMENT

Keep project management separate from ITSM.

Create a dedicated:

# Project Workspace

Every project should open in its own dedicated window.

Example:

```text
Project: Website Development

Overview
Tasks
Board
Timeline
Members
Files
Documents
Activity
Issues
Milestones
Reports
Settings
```

Do not mix all project information into one generic page.

---

# 24. PROJECT WORKSPACE STRUCTURE

Each project should have its own context.

Example route:

```text
/projects/:projectId
```

Inside:

```text
/projects/:projectId/overview
/projects/:projectId/tasks
/projects/:projectId/board
/projects/:projectId/members
/projects/:projectId/files
/projects/:projectId/activity
/projects/:projectId/settings
```

The project workspace should automatically filter all data to that project.

---

# 25. TASK MANAGEMENT

Support:

* task
* subtasks
* assignee
* priority
* status
* due date
* comments
* attachments
* watchers
* dependencies
* activity history

Project task board:

```text
Backlog
Todo
In Progress
Review
Done
```

Allow organizations to customize statuses.

---

# 26. MY WORKSPACE

Create:

# My Workspace

Every user gets a personal workspace.

Display:

* My Tasks
* My Incidents
* My Requests
* My Approvals
* My Projects
* My Notifications
* My SLA items
* Recent Activity

This should become the user's personal command center.

---

# 27. APPROVAL CENTER

Create a dedicated:

# Approval Center

Users can see:

```text
Pending
Approved
Rejected
Cancelled
```

Examples:

* Access approval
* Change approval
* Purchase approval
* Service request approval
* Document approval

---

# 28. SERVICE LEVEL DASHBOARD

Create a dedicated:

# SLA Dashboard

Display:

* Active SLA
* SLA at risk
* SLA breached
* Response SLA
* Resolution SLA
* Average resolution time
* SLA compliance %
* Priority-wise SLA
* Team-wise SLA
* Service-wise SLA

All calculations must follow the organization's configured SLA rules.

---

# 29. REPORTING & ANALYTICS

Create:

# Reports

Organization admins can view:

* Incident volume
* Request volume
* Problem trends
* Change success rate
* SLA compliance
* Average resolution time
* Team performance
* User workload
* Project performance
* Task completion
* Asset statistics

Allow filters:

```text
Date
Team
Department
Service
Priority
Status
User
Category
```

---

# 30. CUSTOM STATUS SYSTEM

Do not hardcode statuses.

Organizations should be able to define statuses for:

* incidents
* requests
* problems
* changes
* projects
* tasks

Example:

```text
Incident:

New
Assigned
Investigating
Pending User
Pending Vendor
Resolved
Closed
```

Another organization can define:

```text
New
Analysis
Work In Progress
Validation
Completed
```

---

# 31. CUSTOM CATEGORY SYSTEM

Allow organization admins to create:

```text
Categories
Subcategories
Services
Service Types
Request Types
Incident Types
Problem Types
Change Types
```

Example:

```text
Network
 ├── WiFi
 ├── LAN
 ├── VPN
 └── Firewall

Hardware
 ├── Laptop
 ├── Desktop
 └── Printer
```

---

# 32. ASSIGNMENT RULE ENGINE

Organizations can define automatic assignment.

Example:

```text
Category = Network
→ Network Team

Category = Hardware
→ Hardware Team

Service = VPN
→ Network Support
```

Advanced:

```text
Category = Network
AND
Priority = P1

→ Network Team
→ Senior Engineer
```

---

# 33. BUSINESS HOURS

Each organization must define:

```text
Working Days
Working Hours
Holidays
Time Zone
```

SLA calculations must respect these settings.

Example:

```text
Monday-Friday
09:00-18:00
```

SLA timers should pause outside business hours if configured by the organization.

---

# 34. NOTIFICATION RULES

Organizations can configure:

```text
Email
In-App
Push-ready architecture
```

Notification triggers:

* ticket created
* ticket assigned
* priority changed
* SLA warning
* SLA breach
* approval requested
* approval completed
* task assigned
* project update
* announcement

---

# 35. AUDIT HISTORY

Every important enterprise action must be recorded.

Example:

```text
Prathamesh changed Incident INC001
Priority: P3 → P2

Rahul assigned INC001
Team: Network → Security

Admin approved CHG001

Manager changed task status
In Progress → Completed
```

Users should be able to see a timeline inside records.

---

# 36. RECORD NUMBERING

Organizations should be able to configure numbering.

Examples:

```text
INC000001
REQ000001
PRB000001
CHG000001
TASK000001
PRJ000001
```

Allow custom prefixes.

Example:

```text
ORG1-INC-00001
IT-REQ-00001
```

---

# 37. RECORD DETAIL WINDOW

Every enterprise record should have a dedicated detail page.

Example:

```text
/incidents/:incidentId
/requests/:requestId
/problems/:problemId
/changes/:changeId
/projects/:projectId
/tasks/:taskId
```

Record page should contain:

```text
Overview
Details
Activity
Comments
Attachments
Related Records
History
Approvals
SLA
```

---

# 38. RELATED RECORDS

Records must be linkable.

Example:

```text
Incident
 ↓
Problem
 ↓
Change
 ↓
Task
```

Also:

```text
Service Request
 ↓
Approval
 ↓
Task
 ↓
Asset
```

Provide a Related Records section.

---

# 39. ROLE + PERMISSION + SCOPE

Permissions must work at multiple levels.

Example:

```text
Can view incidents
Can create incidents
Can edit incidents
Can delete incidents
Can assign incidents
Can resolve incidents
Can close incidents
Can approve changes
Can manage SLA
Can manage workflows
```

Also support scope:

```text
Organization
Department
Team
Project
Own Records
Assigned Records
```

Example:

Manager:

```text
Incident View → Team only
Incident Edit → Assigned team
Incident Assign → Team
Change Approve → No
```

---

# 40. SUPER ADMIN

Platform Super Admin has global control.

Super Admin can manage:

* organizations
* platform users
* global configuration
* platform analytics
* feature flags
* platform audit logs

But organization configuration must remain independent.

Super Admin should be able to inspect an organization for support/admin purposes without accidentally modifying tenant rules.

---

# 41. MULTI-TENANT SECURITY

This requirement is NON-NEGOTIABLE.

Every tenant-owned record must be protected by:

1. Authentication
2. Organization membership
3. Permission check
4. Backend authorization
5. Supabase RLS

Never trust:

```text
organization_id
user_id
role
permission
```

from frontend requests.

Never allow:

```text
Organization A
↓
Request Organization B record
↓
Success
```

It must always fail.

---

# 42. DATABASE ARCHITECTURE

Add tables such as:

```text
organizations
profiles
organization_members
roles
permissions
role_permissions
member_roles

services
service_categories
service_catalog_items

incidents
incident_categories
incident_comments
incident_history

service_requests
request_types
request_fields
request_values

problems
problem_incidents

changes
change_approvals
change_history
cab_meetings

sla_policies
sla_instances
sla_events

workflows
workflow_steps
workflow_conditions
workflow_actions

automation_rules
automation_actions

knowledge_categories
knowledge_articles

assets
asset_types
configuration_items
ci_relationships

projects
project_members
project_tasks
project_milestones

documents
announcements
notifications
approvals

activity_logs
audit_logs
```

Every organization-owned record must contain:

```text
organization_id
```

where appropriate.

---

# 43. CONFIGURATION DATA MODEL

Create organization-specific configuration tables instead of hardcoding rules.

Examples:

```text
organization_settings
incident_priorities
incident_statuses
incident_categories
sla_policies
business_hours
holiday_calendars
approval_rules
workflow_definitions
automation_rules
assignment_rules
service_catalog_items
custom_fields
```

This makes ORG MAN configurable for completely different organizations.

---

# 44. UI NAVIGATION

Use a professional enterprise sidebar.

Suggested:

```text
ORG / WORKSPACE SWITCHER

My Workspace

OPERATIONS
Dashboard
Projects
Tasks
Teams
Departments

SERVICE MANAGEMENT
Service Desk
Incidents
Requests
Service Catalog
Problems
Changes
Approvals

KNOWLEDGE
Knowledge Base

ASSETS
Assets
Configuration Items

ANALYTICS
Reports
SLA Dashboard
Analytics

ADMINISTRATION
Users
Roles & Permissions
Services
Workflows
Automation
Business Rules
Organization Settings
Audit Logs
```

For Super Admin:

```text
PLATFORM

Dashboard
Organizations
Users
Platform Analytics
Feature Management
Platform Audit Logs
Platform Settings
```

---

# 45. DESIGN REQUIREMENT

Create a premium enterprise SaaS UI.

The design should feel:

* professional
* modern
* clean
* powerful
* enterprise-grade
* fast
* easy to navigate

Use separate workspaces for major modules.

Avoid putting 50 features on one screen.

Use:

* sidebar
* top bar
* breadcrumbs
* tabs
* command/search
* tables
* cards
* charts
* drawers
* modals
* detail panels
* timelines
* activity streams

---

# 46. IMPORTANT: EVERY MODULE SHOULD FEEL LIKE ITS OWN WORKSPACE

For example:

### Incident Workspace

```text
Incidents
├── All
├── My Incidents
├── Unassigned
├── Critical
├── SLA At Risk
└── Breached
```

### Change Workspace

```text
Changes
├── All
├── My Changes
├── Pending Approval
├── Scheduled
├── Emergency
└── Completed
```

### Project Workspace

```text
Project
├── Overview
├── Tasks
├── Board
├── Timeline
├── Members
├── Files
├── Activity
└── Settings
```

This pattern should be used throughout ORG MAN.

---

# 47. GLOBAL SEARCH

Create enterprise-level search.

Search across permitted:

```text
Incidents
Requests
Problems
Changes
Projects
Tasks
Users
Clients
Knowledge Articles
Assets
Configuration Items
```

Search results must respect:

* organization
* role
* permissions
* record scope

---

# 48. DASHBOARD CUSTOMIZATION

Allow organizations to customize dashboards.

Widgets can include:

```text
Incident Statistics
Open Requests
SLA Status
Pending Approvals
Project Progress
Task Progress
Team Workload
Recent Activity
Announcements
```

Allow adding/removing/reordering widgets where practical.

---

# 49. FUTURE-READY ARCHITECTURE

Prepare architecture for future modules:

```text
Chat
Email Integration
Microsoft Teams Integration
Slack Integration
Calendar
Webhooks
Public API
API Keys
Mobile Application
AI Assistant
Advanced Workflow Builder
Advanced Reporting
External Monitoring Integrations
```

Do not implement all future features unnecessarily now.

Design the architecture so they can be added later.

---

# 50. FINAL IMPLEMENTATION RULE

Do not build ORG MAN as a simple CRUD application.

Build it as:

# Multi-Tenant SaaS + Organization Management + Configurable ITSM Platform

The most important architectural principle is:

```text
Platform
    ↓
Organizations
    ↓
Organization Configuration
    ↓
Users / Roles / Permissions
    ↓
Services
    ↓
ITSM Modules
    ↓
Workflows
    ↓
Automation
    ↓
Projects / Tasks
    ↓
Reports / Audit
```

Every organization can configure its own rules.

For example:

```text
Organization A
    SLA = 2 hours
    Priority Matrix = Custom
    Incident Workflow = Workflow A
    Approval = Manager + CAB

Organization B
    SLA = 4 hours
    Priority Matrix = Custom
    Incident Workflow = Workflow B
    Approval = Department Head
```

Both organizations run on the same ORG MAN platform but have completely independent configurations and data.

---

# 51. IMPLEMENTATION ORDER

Implement in this order:

### Phase 1

Architecture + Database + Multi-tenancy

### Phase 2

Authentication + Organization Membership

### Phase 3

Roles + Permissions + Custom Roles

### Phase 4

Organization Configuration Engine

### Phase 5

Service Desk

### Phase 6

Incident Management + Priority + SLA

### Phase 7

Service Requests + Service Catalog + Custom Forms

### Phase 8

Problem Management

### Phase 9

Change Management + Approval + CAB

### Phase 10

Workflow + Automation + Escalation Engine

### Phase 11

Knowledge + Assets + Configuration Management

### Phase 12

Projects + Tasks + Dedicated Project Workspaces

### Phase 13

Reports + Analytics + Audit

### Phase 14

Super Admin

### Phase 15

Testing + Security + Performance

### Phase 16

Netlify + Supabase Production Deployment

---

# 52. FINAL REQUIREMENT

First inspect the existing project completely.

Do not immediately overwrite everything.

Identify:

* existing architecture
* reusable components
* current routes
* existing UI
* existing backend
* existing database
* existing authentication
* existing mock data
* missing features

Then redesign/restructure the application according to this specification.

The old UI is only a reference.

You have complete freedom to redesign it.

Do not stop after creating the plan.

Actually implement the system phase-by-phase.

At the end, ORG MAN must function as a complete enterprise-grade:

# ORGANIZATION MANAGEMENT + ITSM + WORKFLOW AUTOMATION PLATFORM

with strict multi-tenancy, organization-specific rules, configurable workflows, configurable SLA, RBAC, permissions, Service Desk, Incident, Request, Problem, Change, Approval, Project and Task management.
