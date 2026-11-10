// Titre de page + boutons d'action à droite
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <div className="muted">{subtitle}</div>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}
