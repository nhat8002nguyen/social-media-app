import { createListenerMiddleware } from "@reduxjs/toolkit";
import { PostListState, PostState } from "redux/slices/home/posts/interfaces";
import {
  displayVerifiedStatusOfPostsList,
  fetchSharedPostsOfFollowings,
  setPostsList,
} from "redux/slices/home/posts/postListSlice";
import { RootState } from "redux/store/store";

export const postListListenerMiddleware = createListenerMiddleware();

postListListenerMiddleware.startListening({
  predicate: (action, currentState: RootState, prevState: RootState) => {
    return (
      setPostsList.match(action) ||
      fetchSharedPostsOfFollowings.fulfilled.match(action)
    );
  },
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const postListState = (listenerApi.getState() as RootState)
      .postList as PostListState;

    const posts = postListState.posts as PostState[];

    await listenerApi.dispatch(
      displayVerifiedStatusOfPostsList({
        states: posts,
        start: postListState.previousIndex,
      })
    );
  },
});
