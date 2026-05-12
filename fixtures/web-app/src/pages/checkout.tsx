import { useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const MOCK_ITEMS: CartItem[] = [
  { id: '1', name: 'Enterprise License', price: 999, quantity: 1 },
  { id: '2', name: 'Support Plan', price: 299, quantity: 2 },
];

export default function CheckoutPage(): JSX.Element {
  const [items] = useState<CartItem[]>(MOCK_ITEMS);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main data-testid="checkout-page">
      <h1>Checkout</h1>
      <ul data-testid="cart-items">
        {items.map((item) => (
          <li key={item.id} data-testid={`cart-item-${item.id}`}>
            {item.name} × {item.quantity} — ${item.price}
          </li>
        ))}
      </ul>
      <p data-testid="cart-total">Total: ${total}</p>
      <button data-testid="pay-button">Pay now</button>
    </main>
  );
}
