import { AppButtonLoading } from "@/components/atoms/AppLoading";
import { Button, Modal, Text } from "@nextui-org/react";
import { ReactElement, useState } from "react";

export interface ConfirmModalProps {
  trigger: ReactElement;
  title: string;
  description: string;
  visible: boolean;
	setVisible?: ReturnType<typeof useState<boolean>>[1];
  onConfirmClick: () => Promise<void>;
  onCloseClick: () => void;
  loading: boolean;
}

export default function ConfirmModal({
  trigger,
  title,
  description,
  visible,
	setVisible,
  onConfirmClick,
  onCloseClick,
  loading,
}: ConfirmModalProps) {
	const handleConfirmClick = async () => {
		await onConfirmClick();
		setVisible(false);
	}
  return (
    <div>
      {trigger}
      <Modal
        closeButton
        aria-labelledby="modal-title"
        open={visible}
        onClose={onCloseClick}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            {title}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text>{description}</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={onCloseClick}>
            Close
          </Button>
          <Button disabled={loading} auto onClick={handleConfirmClick}>
            {!loading ? "Confirm" : <AppButtonLoading />}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
