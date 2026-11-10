export default function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <input
      type="search"
      className="input search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}
