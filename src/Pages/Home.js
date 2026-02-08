import '../App.css';

function Home() {
  return (
    <div>
      <section className="hero">
        <div className="container">
          <h2>Building Web Applications</h2>
          <p>Full-stack developer specializing in React and modern web technologies</p>
        </div>
      </section>

      <section id="projects" className="projects">
        <div className="container">
          <h2>Projects</h2>
          <div className="project-grid">
            
            <div className="project-card">
              <h3>Customer Onboarding Tracker</h3>
              <p>A SaaS application that helps businesses monitor customer progress through structured onboarding processes with drag-and-drop step management.</p>
              <div className="tech-stack">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Supabase</span>
                <span className="tech-tag">Vercel</span>
              </div>
              <div className="project-links">
                <a href="YOUR_CUSTOMER_TRACKER_URL" target="_blank" rel="noopener noreferrer" className="btn-primary">View Live App</a>
                <a href="YOUR_GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Code</a>
              </div>
            </div>

            <div className="project-card coming-soon">
              <h3>More Projects Coming Soon</h3>
              <p>Currently working on new applications...</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;