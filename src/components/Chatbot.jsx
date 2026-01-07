import { useState } from "react";
import "../styles/Chatbot.css";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="chatbox">
          <div className="chat-header">
            LeadBot <span onClick={() => setOpen(false)}>✖</span>
          </div>
          <div className="chat-body">
            <p className="bot">Nice! What is your role?</p>
            <p className="user">Student</p>
          </div>
        </div>
      )}
    </>
  );
}
