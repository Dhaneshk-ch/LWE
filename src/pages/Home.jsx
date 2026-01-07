import "../styles/Home.css";
import EmotionChart from "../components/EmotionChart";


export default function Home() {
  return (
    <div className="dashboard">
      
     

      {/* MAIN CONTENT */}
      <main className="main">
        
    

        {/* HERO */}
        <div className="hero">
          <div>
            <h2>Sharpen Your Skills With <br /> Professional Online Courses</h2>
            <button>Explore Courses</button>
          </div>
        </div>

        {/* COURSE SECTION */}
        <section>
          <h3>Continue Learning</h3>

          <div className="cards">
            <div className="card">
              <h4>Beginner Guide to Learning</h4>
              <p>UI/UX • 2h 30m</p>
            </div>

            <div className="card">
              <h4>Emotion Aware Learning</h4>
              <p>AI • 3h 15m</p>
            </div>

            <div className="card">
              <h4>Web Development</h4>
              <p>React • 4h</p>
            </div>
          </div>
        </section>

        {/* MENTOR SECTION */}
        <section>
         <h3>Your Mentors</h3>

         <div className="mentor-list">
         <div className="mentor-card">
         <div className="mentor-icon">👨‍🏫</div>
      <div>
        <h4>Alex Morgan</h4>
        <p>UI/UX Design</p>
      </div>
      <button>Message</button>
    </div>

    <div className="mentor-card">
      <div className="mentor-icon">👩‍🏫</div>
      <div>
        <h4>Dr. Ananya Rao</h4>
        <p>Artificial Intelligence</p>
      </div>
      <button>Message</button>
    </div>

    <div className="mentor-card">
      <div className="mentor-icon">👨‍🏫</div>
      <div>
        <h4>Rahul Verma</h4>
        <p>Machine Learning</p>
      </div>
      <button>Message</button>
    </div>

    <div className="mentor-card">
      <div className="mentor-icon">👩‍🏫</div>
      <div>
        <h4>Priya Sharma</h4>
        <p>React & Frontend Development</p>
      </div>
      <button>Message</button>
    </div>
  </div>
</section>


      </main>

    </div>
  );
}
