import { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;