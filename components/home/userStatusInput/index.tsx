import { PostModal } from "@/components/mocules/evaluationPostModal";
import { AccountCircleRounded, AddCircleRounded } from "@mui/icons-material";
import { useModal } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { RootState, useAppDispatch } from "redux/store/store";
import styles from "./styles.module.css";

export default function UserStatusInput({ refreshNewsFeed }) {
  const dispatch = useAppDispatch();
  const { setVisible, bindings } = useModal();
  const { session, sessionStatus }: AuthState = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <form className={styles.userStatusInput}>
      <AccountCircleRounded className={styles.avatarIcon} />
      <div className={styles.formHeader}>
        <label className={styles.formLabel} onClick={() => setVisible(true)}>
          Let's give a review
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
