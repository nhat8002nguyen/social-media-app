import { PostListRequestDto } from "apis/home/interfaces";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostListState, PostState } from "redux/slices/home/posts/interfaces";
import {
  fetchSharedPostsOfFollowings,
  findNewsFeedPosts,
  setPostsList,
} from "redux/slices/home/posts/postListSlice";
import { AppDispatch, RootState, useAppDispatch } from "redux/store/store";

export interface UseNewsFeed {
  initialPosts?: PostState[];
}

export default function useNewsFeed({ initialPosts }: UseNewsFeed) {
  const dispatch = useAppDispatch();
  const [refreshCount, refresh] = useState(0);
  const refreshNewsFeed = () => refresh(refreshCount + 1);
  const { session: authSession, sessionStatus }: AuthState = useSelector(
    (state: RootState) => state.auth
  );
  const { currentHomePosts }: PostListState = useSelector(
    (state: RootState) => state.postList
  );

  useEffect(() => {
    if (initialPosts?.length > 0 && sessionStatus == "unauthenticated") {
      dispatch(setPostsList(initialPosts));
    }
  }, [initialPosts, sessionStatus]);

  useEffect(() => {
    if (sessionStatus == "authenticated" && authSession?.user.DBID != null) {
      const userId = authSession?.user.DBID;
      if (userId == null) {
        return;
      }
      if (currentHomePosts.length > 0) {
        dispatch(setPostsList(currentHomePosts));
      } else {
        fetchNewsFeedPosts(dispatch, userId);
      }
    }
  }, [authSession, refreshCount]);

  return { refreshNewsFeed };
}

export const fetchNewsFeedPosts = async (
  dispatch: AppDispatch,
  userId: number
) => {
  const request: PostListRequestDto = {
    userId: userId,
  };
  await dispatch(findNewsFeedPosts(request));
  await dispatch(fetchSharedPostsOfFollowings({ user_id: userId }));
};
