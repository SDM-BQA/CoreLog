import { Trash2 } from "lucide-react";
import Modal from "./Modal";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, title, itemName }: DeleteModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            {title}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 size={32} className="text-red-500" />
        </div>
        <h3 className="text-text-primary text-lg font-bold mb-2">Are you sure?</h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          This action cannot be undone. This will permanently delete{" "}
          <span className="text-text-primary font-semibold">"{itemName}"</span> from your collection.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteModal;
