import { Routes, Route, useLocation } from "react-router-dom";
import { useRef } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WebcamBox from "./components/WebcamBox";

import "./styles/GamesHub.css"; // global styles

import Home from "./pages/Home";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Learning from "./pages/Learning";
import Analytics from "./pages/Analytics";
import ModulePage from "./pages/ModulePage";

import GamesHub from "./pages/GamesHub";
import Quiz from "./pages/Quiz";
import PuzzleGame from "./pages/PuzzleGame";
import WorkflowGame from "./pages/WorkflowGame";

function App() {
  const location = useLocation();
  const webcamRef = useRef(null);

  // ✅ Pages where webcam should be visible
  const showWebcam =
    location.pathname.startsWith("/courses") ||
    location.pathname.startsWith("/learning") ||
    location.pathname.startsWith("/learning/week");

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/learning/week/:weekId" element={<ModulePage />} />
        <Route path="/analytics" element={<Analytics />} />

        <Route path="/gameshub" element={<GamesHub />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/puzzle" element={<PuzzleGame />} />
        <Route path="/workflow" element={<WorkflowGame />} />
      </Routes>

      {/* ✅ Webcam at bottom-left only for learning-related pages */}
      {showWebcam && <WebcamBox webcamRef={webcamRef} />}

      <Footer />
    </>
  );
}

export default App;
