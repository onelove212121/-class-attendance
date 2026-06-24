import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import LiveStatus from "./pages/LiveStatus";
import Attendance from "./pages/Attendance";
import Students from "./pages/Students";
import Sections from "./pages/Sections";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 px-8 py-8 overflow-x-auto">
          <Routes>
            <Route path="/" element={<LiveStatus />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/students" element={<Students />} />
            <Route path="/sections" element={<Sections />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
