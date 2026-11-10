import SearchSelect from './SearchSelect';

// Un champ de formulaire. "field" décrit le champ :
//   { name, label, type, required, options, placeholder, help, full, searchable }
// searchable: true (avec type select) -> liste avec zone de recherche (utile pour de longues listes : étudiants...)
// type : text | email | tel | password | number | money | date | time | textarea | select | checkbox
export default function Field({ field, value, onChange, options = [] }) {
  const { name, label, type = 'text', required = false, placeholder, help, full } = field;
  const id = `f-${name}`;
  const set = (v) => onChange(name, v);

  if (type === 'checkbox') {
    return (
      <div className={`field field-check${full ? ' field-full' : ''}`}>
        <input id={id} type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} />
        <label htmlFor={id}>{label}</label>
      </div>
    );
  }

  let input;
  if (type === 'select' && field.searchable) {
    input = <SearchSelect id={id} value={value} options={options} onChange={set} required={required} placeholder={placeholder} />;
  } else if (type === 'select') {
    input = (
      <select id={id} className="input" value={value ?? ''} onChange={(e) => set(e.target.value)} required={required}>
        <option value="">— Choisir —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (type === 'textarea') {
    input = (
      <textarea id={id} className="input" rows="3" value={value ?? ''} onChange={(e) => set(e.target.value)} required={required} placeholder={placeholder} />
    );
  } else {
    const htmlType = type === 'money' ? 'number' : type;
    input = (
      <input
        id={id}
        className="input"
        type={htmlType}
        value={value ?? ''}
        onChange={(e) => set(e.target.value)}
        required={required}
        placeholder={placeholder}
        min={htmlType === 'number' ? 0 : undefined}
        step={htmlType === 'number' ? 'any' : undefined}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
      />
    );
  }

  return (
    <div className={`field${full || type === 'textarea' ? ' field-full' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {input}
      {help && <div className="help">{help}</div>}
    </div>
  );
}
