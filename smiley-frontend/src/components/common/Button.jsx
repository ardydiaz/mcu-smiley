export default function Button({ children, variant = 'primary', icon: Icon, type = 'button', iconOnly = false, className = '', ...props }) {
  const buttonClass = ['button', variant, iconOnly ? 'icon-only' : '', className].filter(Boolean).join(' ');
  const tooltip = iconOnly ? props['aria-label'] || children : '';

  return (
    <button type={type} className={buttonClass} {...props}>
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      {iconOnly ? <span className="sr-only">{children}</span> : <span>{children}</span>}
      {tooltip ? <span className="button-tooltip" role="tooltip">{tooltip}</span> : null}
    </button>
  );
}
