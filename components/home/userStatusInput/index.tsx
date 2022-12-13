import { PostModal } from "@/components/mocules/evaluationPostModal";
import { AccountCircleRounded, AddCircleRounded } from "@mui/icons-material";
import { useModal } from "@nextui-org/react";
import styles from "./styles.module.css";

export default function UserStatusInput() {
  const { setVisible, bindings } = useModal();

  return (
    <form className={styles.userStatusInput}>
      <AccountCircleRounded className={styles.avatarIcon} />
      <div className={styles.formHeader}>
        <label className={styles.formLabel} onClick={() => setVisible(true)}>
          {"Let's give a review"}
        </label>
      </div>
      <AddCircleRounded
        className={styles.addIcon}
        onClick={() => setVisible(true)}
      />
      <PostModal
        setVisible={setVisible}
        bindings={bindings}
        purpose="add"
      ></PostModal>
    </form>
  );
}
