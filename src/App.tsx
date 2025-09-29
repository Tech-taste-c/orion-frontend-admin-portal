import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { toast } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginRoute from "./components/LoginRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import CreateCourseStepper from "./pages/CreateCourseStepper";
import Certifications from "./pages/Certifications";
import PendingSubmissions from "./pages/PendingSubmissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route 
        path="/login" 
        element={
          <LoginRoute>
            <Login />
          </LoginRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/students" 
        element={
          <ProtectedRoute>
            <Students onBack={handleBack} onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/courses" 
        element={
          <ProtectedRoute>
            <Courses onBack={handleBack} onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/courses/create" 
        element={
          <ProtectedRoute>
            <CreateCourseStepper onBack={handleBack} onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/certifications" 
        element={
          <ProtectedRoute>
            <Certifications onBack={handleBack} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pending-submissions" 
        element={
          <ProtectedRoute>
            <PendingSubmissions onBack={handleBack} onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
