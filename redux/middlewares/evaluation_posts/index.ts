import { createListenerMiddleware } from "@reduxjs/toolkit";
import { PostListState, PostState } from "redux/slices/home/posts/interfaces";
import {
  displayVerifiedStatusOfPostsList,
  fetchSharedPostsOfFollowings,
  findNewsFeedPosts,
  saveCurrentHomePosts,
  setPostsList,
} from "redux/slices/home/posts/postListSlice";
import { RootState } from "redux/store/store";

export const postListListenerMiddleware = createListenerMiddleware();

export const homeFeedListenerMiddleware = createListenerMiddleware();

postListListenerMiddleware.startListening({
  predicate: (action, currentState: RootState, prevState: RootState) => {
    return (
      setPostsList.match(action) ||
      fetchSharedPostsOfFollowings.fulfilled.match(action)
    );
  },
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();

    await listenerApi.delay(1000);

    const postListState = (listenerApi.getState() as RootState)
      .postList as PostListState;

    const posts = postListState.posts as PostState[];
    const prevPosts = postListState.currentHomePosts;

    if (isPrevPostsIncludesNewPosts(prevPosts, posts)) {
      // If previous post list includes new post list, stop make below requests.
      return;
    }

    await listenerApi.dispatch(
      displayVerifiedStatusOfPostsList({
        states: posts,
        start: postListState.previousIndex,
      })
    );
  },
});

function isPrevPostsIncludesNewPosts(
  prevPosts: Array<PostState>,
  posts: Array<PostState>
) {
  for (let i = 0; i < posts.length; i++) {
    const existing = prevPosts.find((prev) => prev.id === posts[i].id);
    if (!existing) {
      return false;
    }
  }
  return true;
}

homeFeedListenerMiddleware.startListening({
  predicate: function (action, currentState: RootState) {
    return (
      findNewsFeedPosts.fulfilled.match(action) ||
      fetchSharedPostsOfFollowings.fulfilled.match(action)
    );
  },
  effect: async function (action, listenerAPI) {
    listenerAPI.cancelActiveListeners();

    // wait until other middlewares end before saving home feed.
    await listenerAPI.delay(3000);

    listenerAPI.dispatch(saveCurrentHomePosts());
  },
});
