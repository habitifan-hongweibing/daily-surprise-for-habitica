import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-habitica-dark-modal z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-habitica-dark w-full max-w-lg rounded-lg shadow-xl border border-habitica-main p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-habitica-light">{title}</h2>
          <button onClick={onClose} className="text-habitica-text-secondary hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-habitica-text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
