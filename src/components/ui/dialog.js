import * as Dialog from "@radix-ui/react-dialog";

export const Modal = ({ open, onOpenChange, children }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed w-full max-w-2xl p-6 transform -translate-x-1/2 -translate-y-1/2 correos-card top-1/2 left-1/2">
          {children}
          <Dialog.Close className="absolute top-4 right-4 text-yellow-500 hover:text-yellow-300 text-2xl font-bold">✖</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
