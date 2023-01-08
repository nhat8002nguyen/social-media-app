import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostListState } from "redux/slices/home/posts/interfaces";
import { PostFormState } from "redux/slices/home/posts/postFormSlice";
import { RootState, useAppDispatch } from "redux/store/store";
import { fetchNewsFeedPosts } from "./useNewsFeed";

export const useRefreshNewsFeed = () => {
  const dispatch = useAppDispatch();
  const { requestStatus, requestUpdationStatus }: PostFormState = useSelector(
    (state: RootState) => state.postForm
  );
  const { session }: AuthState = useSelector((state: RootState) => state.auth);
  const { posts }: PostListState = useSelector(
    (state: RootState) => state.postList
  );

  // Re-load new feed if request is successful
  useEffect(() => {
    if (requestStatus == "succeeded" || requestUpdationStatus == "succeeded") {
      fetchNewsFeedPosts(dispatch, session?.user.DBID);
    }
  }, [requestStatus, requestUpdationStatus]);

  // Re-load new feed if request is crash
  useEffect(() => {
    const userId = session?.user.DBID;
    if (userId && posts.length == 0) {
      fetchNewsFeedPosts(dispatch, userId);
    }
  }, [posts, session]);
};
