import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmationDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
};

export const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const {
    open = false,
    onConfirm,
    onCancel,
    cancelButtonText = "Cancel",
    confirmButtonText = "Confirm",
    title,
    description,
  } = props;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {!!title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onCancel()}>
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm()}>
            {confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
