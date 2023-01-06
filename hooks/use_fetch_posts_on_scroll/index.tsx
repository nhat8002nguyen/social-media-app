import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { setScrollTopBtnVisible } from "redux/slices/global";
import { PostListState } from "redux/slices/home/posts/interfaces";
import {
  fetchMoreNewsFeed,
  fetchSharedPostsOfFollowings,
} from "redux/slices/home/posts/postListSlice";
import { RootState, useAppDispatch } from "redux/store/store";

export default function useFetchPostsOnScroll() {
  const dispatch = useAppDispatch();

  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [scrollBtnVisible, setScrollBtnVisible] = useState<boolean>(false);

  const { session: authSession, sessionStatus }: AuthState = useSelector(
    (state: RootState) => state.auth
  );

  const {
    newsFeedPagingInfo: { nextFollowingOffset, nextOwnerOffset },
    followingsSharedPostsNextOffset,
  }: PostListState = useSelector((state: RootState) => state.postList);

  // take action when scrolling
  useEffect(() => {
    if (document) {
      const getScrollPercent = () => {
        var h = document.documentElement,
          b = document.body,
          st = "scrollTop",
          sh = "scrollHeight";
        return ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
      };
      document.onscroll = () => {
        window.scrollY > 2000
          ? setScrollBtnVisible(true)
          : setScrollBtnVisible(false);

        const percent = getScrollPercent();

        const userId = authSession?.user.DBID;
        if (percent >= 90 && userId) {
          setFetchLoading(true);
        } else {
          setFetchLoading(false);
        }
      };
    }
  });

  // start fetching posts a time if possible
  useEffect(() => {
    if (fetchLoading) {
      fetchMorePosts();
    }
  }, [fetchLoading]);

  // toggle visible of scroll button
  useEffect(() => {
    scrollBtnVisible
      ? dispatch(setScrollTopBtnVisible(true))
      : dispatch(setScrollTopBtnVisible(false));
  }, [scrollBtnVisible]);

  const fetchMorePosts = async () => {
    const sUserId = authSession?.user.DBID;
    if (!sUserId) {
      return;
    }

    await dispatch(
      fetchMoreNewsFeed({
        userId: sUserId,
        ownerOffset: nextOwnerOffset,
        followingOffset: nextFollowingOffset,
      })
    );
    await dispatch(
      fetchSharedPostsOfFollowings({
        user_id: sUserId,
        offset: followingsSharedPostsNextOffset,
      })
    );
  };
}
