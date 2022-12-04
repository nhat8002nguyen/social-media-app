import { Button, Image, Modal } from "@nextui-org/react";
import { useState } from "react";

interface ImageViewModalProps {
	src: string;
	visible: ReturnType<typeof useState<boolean>>[0];
	setVisible: ReturnType<typeof useState<boolean>>[1];
}

export const ImageViewModal = ({src, visible = false, setVisible}: ImageViewModalProps) => {
  const closeHandler = () => {
    setVisible(false);
  };
  return (
    <div>
      <Modal noPadding open={visible} onClose={closeHandler} scroll fullScreen closeButton>
        <Modal.Body>
          <Image
            showSkeleton
            src={src}
						alt="Not found!"
          />
        </Modal.Body>
				<Modal.Footer>
          <Button flat auto color="error" onClick={() => setVisible(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}