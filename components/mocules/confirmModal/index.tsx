import { AppButtonLoading } from "@/components/atoms/AppLoading";
import { Button, Modal, Text } from "@nextui-org/react";
import { ReactElement } from "react";

export interface ConfirmModalProps {
  trigger: ReactElement;
  title: string;
  description: string;
  visible: boolean;
  onConfirmClick: () => void;
  onCloseClick: () => void;
  loading: boolean;
}

export default function ConfirmModal({
  trigger,
  title,
  description,
  visible,
  onConfirmClick,
  onCloseClick,
  loading,
}: ConfirmModalProps) {
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
          <Button auto onClick={onConfirmClick}>
            {loading == false ? "Confirm" : <AppButtonLoading />}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
