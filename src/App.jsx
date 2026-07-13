import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Medicines from "./pages/Medicines";
import AIChat from "./pages/AIChat";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/aichat" element={<AIChat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;