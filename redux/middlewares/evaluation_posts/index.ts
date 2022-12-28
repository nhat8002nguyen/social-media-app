import { createListenerMiddleware } from "@reduxjs/toolkit";
import { PostListState, PostState } from "redux/slices/home/posts/interfaces";
import {
  displayVerifiedStatusOfPostsList,
  fetchSharedPostsOfFollowings,
  findNewsFeedPosts,
  setPostsList,
} from "redux/slices/home/posts/postListSlice";
import { RootState } from "redux/store/store";

export const postListListenerMiddleware = createListenerMiddleware();
export const trendingPostsListenerMiddleware = createListenerMiddleware();

postListListenerMiddleware.startListening({
  predicate: (action, currentState: RootState) => {
    return (
      (findNewsFeedPosts.fulfilled.match(action) ||
        setPostsList.match(action) ||
        fetchSharedPostsOfFollowings.fulfilled.match(action)) &&
      (currentState.postList as PostListState).posts.length > 0
    );
  },
  effect: async (action, listenerApi) => {
    const posts = (listenerApi.getState() as RootState).postList
      .posts as PostState[];
    listenerApi.dispatch(displayVerifiedStatusOfPostsList(posts));
  },
});
