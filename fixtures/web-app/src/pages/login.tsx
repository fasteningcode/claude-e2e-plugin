import { useState } from 'react';

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    // Intentionally untested: form submission flow
  }

  return (
    <main data-testid="login-page">
      <h1>Login</h1>
      {error && <p data-testid="error-message" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} data-testid="login-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="email-input"
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="password-input"
        />
        <button type="submit" data-testid="login-button">Sign in</button>
      </form>
    </main>
  );
}
