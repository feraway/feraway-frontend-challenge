import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";

type ErrorDialogProps = {
  open: boolean;
  onConfirm: () => void;
  description: string;
};

export const ErrorDialog = (props: ErrorDialogProps) => {
  const { open = false, onConfirm, description } = props;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-700">Error</AlertDialogTitle>
          <AlertDialogDescription className="text-red-700">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={() => onConfirm()}>
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
