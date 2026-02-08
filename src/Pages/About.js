import '../App.css';

function About() {
  return (
    <div>
      <section className="about">
        <div className="container">
          <h2>About Me</h2>
          <p>I'm a developer passionate about building practical web applications that solve real business problems. My focus is on creating clean, maintainable code and user-friendly interfaces.</p>
          
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>Skills & Technologies</h3>
            <div className="tech-stack">
              <span className="tech-tag">React</span>
              <span className="tech-tag">JavaScript</span>
              <span className="tech-tag">Supabase</span>
              <span className="tech-tag">Git</span>
              <span className="tech-tag">Vercel</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;