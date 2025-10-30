import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard/DashBoard";
import Tracker from "./pages/Tracker/Tracker";
import Goals from "./pages/Goals/Goals";
import { Layout } from "./Layout";
import Projects from "./pages/Projects/Projects";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/home" element={<Dashboard />} />
                  <Route path="/tracker" element={<Tracker />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;