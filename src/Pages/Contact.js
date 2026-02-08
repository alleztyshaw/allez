import '../App.css';

function Contact() {
  return (
    <div>
      <section className="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <p>Interested in working together? Let's connect!</p>
          <a href="mailto:your-email@example.com" className="btn-primary">Send Email</a>
          
          <div style={{ marginTop: '3rem' }}>
            <p style={{ color: '#666' }}>I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;