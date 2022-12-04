import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostFormState } from "redux/slices/home/posts/postFormSlice";
import { findNewsFeedPosts } from "redux/slices/home/posts/postListSlice";
import { toggleSnackbar } from "redux/slices/statusNotifications/snackbarsSlice";
import { RootState, useAppDispatch } from "redux/store/store";

export const useSnackbarNotificationAndRefreshNewsFeed = () => {
  const dispatch = useAppDispatch();
  const {
    requestStatus,
    requestUpdationStatus,
    requestDeletionStatus,
  }: PostFormState = useSelector((state: RootState) => state.postForm);
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (requestStatus == "failed") {
      dispatch(
        toggleSnackbar({
          message: "Failed to create new post, please try again !",
          severity: "error",
        })
      );
    }
    if (requestStatus == "succeeded") {
      dispatch(
        toggleSnackbar({
          message: "Create a new post successfully !",
          severity: "success",
        })
      );
      dispatch(findNewsFeedPosts({ userId: session?.user.db_id }));
    }
  }, [requestStatus]);

  useEffect(() => {
    if (requestUpdationStatus == "failed") {
      dispatch(
        toggleSnackbar({
          message: "Failed to edit this post, please try again !",
          severity: "error",
        })
      );
    }
    if (requestUpdationStatus == "succeeded") {
      dispatch(
        toggleSnackbar({
          message: "Edit your post successfully !",
          severity: "success",
        })
      );
      dispatch(findNewsFeedPosts({ userId: session.user.db_id }));
    }
  }, [requestUpdationStatus]);

  useEffect(() => {
    if (requestDeletionStatus == "failed") {
      dispatch(
        toggleSnackbar({
          message: "Failed to delete this post, please try again !",
          severity: "error",
        })
      );
    }
    if (requestDeletionStatus == "succeeded") {
      dispatch(
        toggleSnackbar({
          message: "Delete your post successfully !",
          severity: "success",
        })
      );
    }
  }, [requestDeletionStatus]);
};
