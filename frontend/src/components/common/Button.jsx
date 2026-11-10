// Bouton : variant = primary | success | warning | danger | outline ; size="sm" pour un petit bouton
export default function Button({
  variant = 'primary',
  size,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''} ${className}`.trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Patientez...' : children}
    </button>
  );
}
