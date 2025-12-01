import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import SearchLeads from "@/pages/SearchLeads";
import ListLeads from "@/pages/ListLeads";
import LeadDetails from "@/pages/LeadDetails";
import SavedLeads from "@/pages/SavedLeads";
import DeletedLeads from "@/pages/DeletedLeads";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <I18nProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
              <Route path="/search" element={<MainLayout><SearchLeads /></MainLayout>} />
              <Route path="/leads" element={<MainLayout><ListLeads /></MainLayout>} />
              <Route path="/leads/:id" element={<MainLayout><LeadDetails /></MainLayout>} />
              <Route path="/saved" element={<MainLayout><SavedLeads /></MainLayout>} />
              <Route path="/deleted" element={<MainLayout><DeletedLeads /></MainLayout>} />
              <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
