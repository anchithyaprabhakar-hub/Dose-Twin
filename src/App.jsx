import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Analytics from "./pages/Analytics";
import AIChat from "./pages/AIChat";
import DigitalTwin from "./pages/DigitalTwin";
import Caregiver from "./pages/Caregiver";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* MAIN APPLICATION LAYOUT */}

        <Route
          element={<DashboardLayout />}
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/medicines"
            element={<Medicines />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/aichat"
            element={<AIChat />}
          />

          <Route
            path="/digital-twin"
            element={<DigitalTwin />}
          />

          <Route
            path="/caregiver"
            element={<Caregiver />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>


        {/* DEFAULT */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;