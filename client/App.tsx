import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import Roles from "./pages/Roles";
import Users from "./pages/Users";
import InviteUser from "./pages/InviteUser";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Pricing from "./pages/Pricing";
import SuperAdmin from "./pages/SuperAdmin";
import DashboardLayout from "./components/DashboardLayout";

import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectHistory from "./pages/ProjectHistory";
import Tasks from "./pages/Tasks";
import CreateTask from "./pages/CreateTask";
import TaskHistory from "./pages/TaskHistory";
import UpdateTask from "./pages/UpdateTask";
import Teams from "./pages/Teams";
import CreateTeam from "./pages/CreateTeam";
import TeamHistory from "./pages/TeamHistory";
import TeamMembers from "./pages/TeamMembers";

import ServiceDesk from "./pages/ServiceDesk";
import CreateTicket from "./pages/CreateTicket";
import Incidents from "./pages/Incidents";
import IncidentHistory from "./pages/IncidentHistory";
import UpdateIncident from "./pages/UpdateIncident";
import Requests from "./pages/Requests";
import CreateRequest from "./pages/CreateRequest";
import UpdateRequest from "./pages/UpdateRequest";
import RequestHistory from "./pages/RequestHistory";
import Approvals from "./pages/Approvals";
import CreateApproval from "./pages/CreateApproval";
import ApprovalDetails from "./pages/ApprovalDetails";

// Knowledge & Assets Phase 3
import KnowledgeBase from "./pages/KnowledgeBase";
import CreateArticle from "./pages/CreateArticle";
import ArticleView from "./pages/ArticleView";
import Reports from "./pages/Reports";
import SLA from "./pages/SLA";
import Workflows from "./pages/Workflows";
import CreateWorkflow from "./pages/CreateWorkflow";
import WorkflowDetails from "./pages/WorkflowDetails";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/invite" element={<Placeholder />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                
                {/* Administration */}
                <Route path="users" element={<Users />} />
                <Route path="users/invite" element={<InviteUser />} />
                <Route path="roles" element={<Roles />} />
                <Route path="workflows" element={<Workflows />} />
                <Route path="workflows/new" element={<CreateWorkflow />} />
                <Route path="workflows/:id" element={<WorkflowDetails />} />
                <Route path="settings" element={<Settings />} />

                {/* Operations */}
                <Route path="projects" element={<Projects />} />
                <Route path="projects/create" element={<CreateProject />} />
                <Route path="projects/:id/history" element={<ProjectHistory />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/create" element={<CreateTask />} />
                <Route path="tasks/:id/update" element={<UpdateTask />} />
                <Route path="tasks/:id/history" element={<TaskHistory />} />
                <Route path="teams" element={<Teams />} />
                <Route path="teams/create" element={<CreateTeam />} />
                <Route path="teams/:id/history" element={<TeamHistory />} />
                <Route path="teams/:id/members" element={<TeamMembers />} />

                {/* Service Management */}
                <Route path="service-desk" element={<ServiceDesk />} />
                <Route path="service-desk/create" element={<CreateTicket />} />
                <Route path="incidents" element={<Incidents />} />
                <Route path="incidents/:id/update" element={<UpdateIncident />} />
                <Route path="incidents/:id/history" element={<IncidentHistory />} />
                <Route path="requests" element={<Requests />} />
                <Route path="requests/create" element={<CreateRequest />} />
                <Route path="requests/:id/update" element={<UpdateRequest />} />
                <Route path="requests/:id/history" element={<RequestHistory />} />

                <Route path="approvals" element={<Approvals />} />
                <Route path="approvals/create" element={<CreateApproval />} />
                <Route path="approvals/:id" element={<ApprovalDetails />} />

                {/* Knowledge */}
                <Route path="knowledge" element={<KnowledgeBase />} />
                <Route path="knowledge/create" element={<CreateArticle />} />
                <Route path="knowledge/:id" element={<ArticleView />} />

                {/* Analytics */}
                <Route path="reports" element={<Reports />} />
                <Route path="sla" element={<SLA />} />

                {/* Fallback for sub-routes currently missing */}
                <Route path="*" element={<Placeholder />} />
              </Route>
              
              <Route path="/superadmin" element={<SuperAdmin />} />
            </Route>
            
            <Route path="*" element={<Placeholder />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
