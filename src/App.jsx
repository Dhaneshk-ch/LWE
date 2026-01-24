import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Learning from "./pages/Learning";
import Analytics from "./pages/Analytics";
import Profile from "./components/ProfilePanel";
import ModulePage from "./pages/ModulePage";
function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      <Route path="/learning/week/:weekId" element={<ModulePage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
