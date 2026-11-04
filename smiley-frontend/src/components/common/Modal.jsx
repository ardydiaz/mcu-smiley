import Button from './Button.jsx';

export default function Modal({ title, children, onClose, footer, className = '' }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className={'modal' + (className ? ' ' + className : '')} role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
        {footer === null ? null : footer || (
          <div className="button-row">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        )}
      </section>
    </div>
  );
}
