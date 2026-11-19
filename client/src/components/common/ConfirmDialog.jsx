import Modal from "./Modal";
import Button from "./Button";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  loading = false,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-app-muted">{description}</p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;