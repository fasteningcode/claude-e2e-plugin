interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  testId?: string;
}

export function Button({ children, onClick, variant = 'primary', disabled, testId }: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      data-variant={variant}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
