import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkItemsProvider } from "./context/WorkItemsContext";
import { TeamsProvider } from "./context/TeamsContext";
import { TeamAssignmentsProvider } from "./context/TeamAssignmentsContext";
import Index from "./pages/Index";
import CreateWorkItem from "./pages/CreateWorkItem";
import WorkItemDetail from "./pages/WorkItemDetail";
import TeamSetup from "./pages/TeamSetup";
import TeamDetail from "./pages/TeamDetail";
import EditTeamDetails from "./pages/EditTeamDetails";
import EditTeamAccesses from "./pages/EditTeamAccesses";
import EditTeamRoles from "./pages/EditTeamRoles";
import AddTeam from "./pages/AddTeam";
import MyTeamAssignment from "./pages/MyTeamAssignment";
import TeamMemberDetails from "./pages/TeamMemberDetails";
import EditTeamMemberDetails from "./pages/EditTeamMemberDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkItemsProvider>
        <TeamsProvider>
          <TeamAssignmentsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create-work-item" element={<CreateWorkItem />} />
                <Route path="/work-item/:id" element={<WorkItemDetail />} />
                <Route path="/team-setup" element={<TeamSetup />} />
                <Route path="/team-setup/new" element={<AddTeam />} />
                <Route path="/team-setup/:id" element={<TeamDetail />} />
                <Route path="/team-setup/:id/edit-details" element={<EditTeamDetails />} />
                <Route path="/team-setup/:id/edit-accesses" element={<EditTeamAccesses />} />
                <Route path="/team-setup/:id/edit-roles" element={<EditTeamRoles />} />
                <Route path="/my-team-assignment" element={<MyTeamAssignment />} />
                <Route path="/my-team-assignment/:teamName" element={<TeamMemberDetails />} />
                <Route path="/my-team-assignment/:teamName/member/:memberId/edit" element={<EditTeamMemberDetails />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TeamAssignmentsProvider>
        </TeamsProvider>
      </WorkItemsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
