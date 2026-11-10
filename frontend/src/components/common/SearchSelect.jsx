import { useEffect, useMemo, useRef, useState } from 'react';
import { norm } from '../../utils/helpers';

/**
 * Liste déroulante avec zone de recherche.
 *  options : [{ value, label }]   value / onChange(value) comme un <select>
 * On tape quelques lettres (nom, prénom, matricule...) et la liste se réduit.
 */
export default function SearchSelect({ id, value, options = [], onChange, required = false, placeholder = 'Rechercher...' }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const box = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value ?? ''));

  const filtered = useMemo(() => {
    const s = norm(q);
    return s ? options.filter((o) => norm(o.label).includes(s)) : options;
  }, [options, q]);

  // Ferme la liste quand on clique ailleurs
  useEffect(() => {
    const out = (e) => {
      if (box.current && !box.current.contains(e.target)) {
        setOpen(false);
        setQ('');
      }
    };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);

  const choose = (o) => {
    onChange(o.value);
    setOpen(false);
    setQ('');
  };

  return (
    <div className="ss" ref={box}>
      <input
        id={id}
        className="input"
        type="text"
        autoComplete="off"
        placeholder={selected ? selected.label : placeholder}
        value={open ? q : selected ? selected.label : ''}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && open) {
            e.preventDefault();
            if (filtered[0]) choose(filtered[0]);
          }
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {/* champ caché : permet à "required" de bloquer l'envoi si rien n'est choisi */}
      <input className="ss-required" tabIndex={-1} aria-hidden="true" required={required} value={value ?? ''} onChange={() => {}} />
      {open && (
        <ul className="ss-list" role="listbox">
          {filtered.length === 0 && <li className="ss-empty">Aucun résultat</li>}
          {filtered.map((o) => (
            <li key={o.value} role="option" aria-selected={String(o.value) === String(value ?? '')} className={String(o.value) === String(value ?? '') ? 'ss-on' : ''} onMouseDown={() => choose(o)}>
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
