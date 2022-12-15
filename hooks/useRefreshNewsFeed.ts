import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostFormState } from "redux/slices/home/posts/postFormSlice";
import { findNewsFeedPosts } from "redux/slices/home/posts/postListSlice";
import { RootState, useAppDispatch } from "redux/store/store";

export const useRefreshNewsFeed = () => {
  const dispatch = useAppDispatch();
  const { requestStatus, requestUpdationStatus }: PostFormState = useSelector(
    (state: RootState) => state.postForm
  );
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (requestStatus == "succeeded" || requestUpdationStatus == "succeeded") {
      dispatch(findNewsFeedPosts({ userId: session?.user.DBID }));
    }
  }, [requestStatus, requestUpdationStatus]);
};
