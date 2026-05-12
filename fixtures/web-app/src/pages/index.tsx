export default function HomePage(): JSX.Element {
  return (
    <main data-testid="home-page">
      <h1>ClaudeTest Demo App</h1>
      <nav>
        <a href="/login">Login</a>
        <a href="/checkout">Checkout</a>
        <a href="/dashboard">Dashboard</a>
      </nav>
    </main>
  );
}
