import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Medicines from "./pages/Medicines";
import AIChat from "./pages/AIChat";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/aichat" element={<AIChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;