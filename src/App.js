import './App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>Allez Capital</h1>
          <nav>
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="container">
            <h2>Building tools for a new future</h2>
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

        <section id="about" className="about">
          <div className="container">
            <h2>About Me</h2>
            <p>I am a strategic operator looking to build things that help people.</p>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="container">
            <h2>Get In Touch</h2>
            <p>Interested in working together? Let's connect!</p>
            <a href="mailto:your-email@example.com" className="btn-primary">Send Email</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Allez Capital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;