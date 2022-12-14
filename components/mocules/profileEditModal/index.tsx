import { AppButtonLoading } from "@/components/atoms/AppLoading";
import { defaultProfileAbout } from "@/components/profile/profile_summary_card/ProfileSummaryCard";
import {
  Button,
  FormElement,
  Input,
  Modal,
  Text,
  Textarea,
} from "@nextui-org/react";
import { ChangeEvent, ReactElement, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostFormState } from "redux/slices/home/posts/postFormSlice";
import { editProfileSummary } from "redux/slices/profile/summary/summarySlice";
import { notifyRequestStatus } from "redux/slices/statusNotifications/snackbarsSlice";
import { RootState, useAppDispatch } from "redux/store/store";
import { EditableProfileState, ProfileEditModalProps } from "./interfaces";
import styles from "./styles.module.css";

export const ProfileEditModal = ({
  bindings,
  setVisible,
  prevProfileInfo,
  loading,
}: ProfileEditModalProps): ReactElement => {
  const dispatch = useAppDispatch();
  const { requestStatus, requestUpdationStatus }: PostFormState = useSelector(
    (state: RootState) => state.postForm
  );
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  const [profileInfo, setProfileInfo] = useState<EditableProfileState>(() => {
    return {
      username: prevProfileInfo?.username ?? "",
      shortBio: prevProfileInfo?.shortBio ?? "User",
      phone: prevProfileInfo?.phone ?? "",
      about:
        prevProfileInfo?.about ??
        defaultProfileAbout(prevProfileInfo?.username),
    };
  });

  const handleUsernameChange = (e: ChangeEvent<FormElement>) => {
    setProfileInfo((prev) => ({ ...prev, username: e.target.value }));
  };

  const handleBioChange = (e: ChangeEvent<FormElement>) => {
    setProfileInfo((prev) => ({ ...prev, shortBio: e.target.value }));
  };

  const handlePhoneChange = (e: ChangeEvent<FormElement>) => {
    setProfileInfo((prev) => ({ ...prev, phone: e.target.value }));
  };

  const handleAboutChange = (e: ChangeEvent<FormElement>) => {
    setProfileInfo((prev) => ({ ...prev, about: e.target.value }));
  };

  const handleConfirmClick = async () => {
    try {
      const isProfileInfoValid = validateProfileInfo(profileInfo);
      if (!isProfileInfoValid) {
        return;
      }
      const trimmedProfileInfo: EditableProfileState = {
        username: profileInfo.username.trim(),
        shortBio: profileInfo.shortBio.trim(),
        phone: profileInfo.phone.trim(),
        about: profileInfo.about.trim(),
      };

      await dispatch(
        editProfileSummary({
          user_id: session?.user.DBID,
          user_name: trimmedProfileInfo.username,
          short_bio: trimmedProfileInfo.shortBio,
          phone: trimmedProfileInfo.phone,
          about: trimmedProfileInfo.about,
        })
      );
      dispatch(
        notifyRequestStatus({
          severity: "success",
          message: "Update profile successfully !",
        })
      );
    } catch (rejected) {
      dispatch(
        notifyRequestStatus({
          severity: "error",
          message: "Something wrong, please try again !",
        })
      );
    }
    setVisible(false);
  };

  const validateProfileInfo = (profileInfo: EditableProfileState) => {
    if (profileInfo.username.length < 5) {
      dispatch(
        notifyRequestStatus({
          severity: "error",
          message:
            "User name should not be empty and at least 5 characters, please fill it ?",
        })
      );
      return false;
    }
    if (
      profileInfo.phone.length > 0 &&
      !profileInfo.phone.match(RegExp("^\\d{5,11}$"))
    ) {
      dispatch(
        notifyRequestStatus({
          severity: "error",
          message: "Phone should be at least 5 and at most 12 digits",
        })
      );
      return false;
    }

    return true;
  };

  return (
    <div>
      {!prevProfileInfo ? null : (
        <Modal
          width="600px"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          {...bindings}
        >
          <Modal.Header>
            <Text id="modal-title" size={18}>
              {"Edit your profile"}
            </Text>
          </Modal.Header>
          <Modal.Body className={styles.modalBody}>
            <Input
              bordered
              label="Username"
              initialValue={profileInfo.username}
              onChange={handleUsernameChange}
              color="primary"
            />
            <Input
              bordered
              label="ShortBio"
              initialValue={profileInfo.shortBio}
              onChange={handleBioChange}
              color="primary"
            />
            <Input
              bordered
              label="Phone"
              initialValue={profileInfo.phone}
              onChange={handlePhoneChange}
              color="primary"
            />
            <Textarea
              color="primary"
              label="About"
              bordered
              initialValue={profileInfo.about}
              onChange={handleAboutChange}
              rows={7}
            />
          </Modal.Body>
          <Modal.Footer justify="flex-end">
            <div className={styles.footerButtons}>
              <Button auto flat color="error" onClick={() => setVisible(false)}>
                Close
              </Button>
              <Button
                auto
                onClick={() => handleConfirmClick()}
                disabled={loading}
              >
                {loading ? <AppButtonLoading /> : "Confirm"}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};
