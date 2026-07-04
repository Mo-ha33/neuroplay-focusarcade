import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RbacProvider } from "./contexts/RbacContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentPortal from "./pages/StudentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import ParentPortal from "./pages/ParentPortal";
import AdminPortal from "./pages/AdminPortal";

function Router() {
  return (
    <Switch>
      {/* Default: SpaceLab game (unauthenticated entry point) */}
      <Route path={"/"} component={Home} />

      {/* RBAC Login — unified role-selector login page */}
      <Route path={"/login"} component={Login} />

      {/* Role-specific portals */}
      <Route path={"/student"} component={StudentPortal} />
      <Route path={"/teacher"} component={TeacherPortal} />
      <Route path={"/parent"} component={ParentPortal} />
      <Route path={"/admin"} component={AdminPortal} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark">
          <RbacProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </RbacProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
