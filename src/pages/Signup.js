import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email to confirm your account!');
    }
  };

  return (
    <div className="login-container">
      <h2>Create an Account</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
        {message && <p>{message}</p>}
      </form>
      <p>Already have an account? <span onClick={() => navigate('/')} style={{cursor:'pointer', color:'purple'}}>Log in</span></p>
    </div>
  );
}

export default Signup;