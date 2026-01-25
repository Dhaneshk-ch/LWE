import { Routes, Route } from "react-router-dom";
import "./styles/GamesHub.css"; // ✅ GLOBAL IMPORT (IMPORTANT)
import GamesHub from "./pages/gameshub/GamesHub";
import WorkflowGame from "./pages/gameshub/WorkflowGame";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Learning from "./pages/Learning";
import Analytics from "./pages/Analytics";

import Quiz from "./pages/gameshub/Quiz";

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
        <Route path="/gameshub" element={<GamesHub />} />
        
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/workflow" element={<WorkflowGame />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
