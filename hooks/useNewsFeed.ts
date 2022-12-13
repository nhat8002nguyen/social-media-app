import { PostListRequestDto } from "apis/home/interfaces";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  findNewsFeedPosts,
  PostState,
  setPostsList,
} from "redux/slices/home/posts/postListSlice";
import { RootState, useAppDispatch } from "redux/store/store";

export interface UseNewsFeed {
  initialPosts?: PostState[];
}

export default function useNewsFeed({ initialPosts }: UseNewsFeed) {
  const dispatch = useAppDispatch();
  const [refreshCount, refresh] = useState(0);
  const refreshNewsFeed = () => refresh(refreshCount + 1);
  const { data: session, status: sessionState } = useSession();
  const {
    session: authSession,
    sessionStatus: authSessionStatus,
    syncDBStatus,
  }: AuthState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (initialPosts?.length > 0) {
      dispatch(setPostsList(initialPosts));
    }
  }, []);

  useEffect(() => {
    if (sessionState == "authenticated" && session.user != null) {
      const userId = authSession?.user?.DBID;
      if (userId == null) {
        return;
      }
      fetchNewsFeedPosts(userId);
    }
  }, [sessionState, authSession, refreshCount]);

  const fetchNewsFeedPosts = (userId: number) => {
    const request: PostListRequestDto = {
      userId: userId,
    };
    dispatch(findNewsFeedPosts(request));
  };

  return { refreshNewsFeed };
}
