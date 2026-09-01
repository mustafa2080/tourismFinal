import React, { useEffect } from 'react';

/**
 * Reusable Modal Component
 * Supports multiple sizes and actions
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  ...props
}) => {
  /**
   * Handle escape key
   */
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  /**
   * Prevent body scroll when modal open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = `modal-${size}`;
  const classes = [sizeClass, className].filter(Boolean).join(' ');

  return (
    <div className="modal-overlay" onClick={() => closeOnBackdrop && onClose()}>
      <div
        className={`modal ${classes}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {closeButton && (
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

/**
 * Modal Sizes:
 * - sm: Small modal
 * - md: Medium modal (default)
 * - lg: Large modal
 * - xl: Extra large modal
 * - fullscreen: Full screen modal
 */

/**
 * Usage Examples:
 * 
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure?</p>
 * </Modal>
 * 
 * <Modal
 *   isOpen={showDetails}
 *   onClose={() => setShowDetails(false)}
 *   title="Package Details"
 *   size="lg"
 *   footer={
 *     <>
 *       <button onClick={() => setShowDetails(false)}>Close</button>
 *       <button variant="primary">Book Now</button>
 *     </>
 *   }
 * >
 *   <PackageDetailsContent />
 * </Modal>
 */
