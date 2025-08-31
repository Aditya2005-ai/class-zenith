import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import FacultyManagement from "./pages/FacultyManagement";
import SmartScheduling from "./pages/SmartScheduling";
import MultiDepartment from "./pages/MultiDepartment";
import ResourceOptimization from "./pages/ResourceOptimization"
// import WorkflowManagement from "./pages/WorkflowManagement";
import AnalyticsReports from "./pages/AnalyticsReports";
import TimetableGenerator from "./pages/TimeTableGenerator";




const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/faculty-management" element={<FacultyManagement />} />
          <Route path="/smart-scheduling" element={<SmartScheduling />} />
          <Route path="/multi-department" element={<MultiDepartment />} />
          <Route path="/resource-optimization" element={<ResourceOptimization />} />
          <Route path="/timetable-generator" element={<TimetableGenerator />} />
          {/* <Route path="/workflow-management" element={<WorkflowManagement />} />  */}
          <Route path="/analytics-reports" element={<AnalyticsReports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
