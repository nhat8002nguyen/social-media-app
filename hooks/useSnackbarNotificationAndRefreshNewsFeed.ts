import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostFormState } from "redux/slices/home/posts/postFormSlice";
import { findNewsFeedPosts } from "redux/slices/home/posts/postListSlice";
import { notifyRequestStatus } from "redux/slices/statusNotifications/snackbarsSlice";
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
        notifyRequestStatus({
          message: "Failed to create new post, please try again !",
          severity: "error",
        })
      );
    }
    if (requestStatus == "succeeded") {
      dispatch(
        notifyRequestStatus({
          message: "Create a new post successfully !",
          severity: "success",
        })
      );
      dispatch(findNewsFeedPosts({ userId: session?.user.DBID }));
    }
  }, [requestStatus]);

  useEffect(() => {
    if (requestUpdationStatus == "failed") {
      dispatch(
        notifyRequestStatus({
          message: "Failed to edit this post, please try again !",
          severity: "error",
        })
      );
    }
    if (requestUpdationStatus == "succeeded") {
      dispatch(
        notifyRequestStatus({
          message: "Edit your post successfully !",
          severity: "success",
        })
      );
      dispatch(findNewsFeedPosts({ userId: session.user.DBID }));
    }
  }, [requestUpdationStatus]);

  useEffect(() => {
    if (requestDeletionStatus == "failed") {
      dispatch(
        notifyRequestStatus({
          message: "Failed to delete this post, please try again !",
          severity: "error",
        })
      );
    }
    if (requestDeletionStatus == "succeeded") {
      dispatch(
        notifyRequestStatus({
          message: "Delete your post successfully !",
          severity: "success",
        })
      );
    }
  }, [requestDeletionStatus]);
};
