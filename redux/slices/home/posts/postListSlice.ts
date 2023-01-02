import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PostListRequestDto, UsedProofReqDto } from "apis/home/interfaces";
import * as postListApi from "../../../../apis/home/postListAPI";
import { RootState } from "../../../store/store";
import { PostListState, PostState } from "./interfaces";
import { PostDeletionState } from "./postFormSlice";
import * as postsConverter from "./postsConverter";

const initialState: PostListState = {
  posts: [],
  loading: "idle",
  deleteRequestStatus: "idle",
};

export const postListSlice = createSlice({
  name: "postList",
  initialState,
  reducers: {
    increaseCommentCountOfPost(state, action: PayloadAction<number>) {
      const targetPost = state.posts.find((post) => post.id == action.payload);
      if (targetPost != null) {
        targetPost.commentCount++;
      }
    },
    setPostsList(state, action: PayloadAction<PostState[]>) {
      state.posts = action.payload;
    },
    setPostLiked(
      state,
      action: PayloadAction<{ postId: number; isLiked: boolean }>
    ) {
      const post = state.posts.find((post) => post.id == action.payload.postId);
      if (post) {
        post.isLiked = action.payload.isLiked;
        if (action.payload.isLiked) {
          post.likedCount++;
        } else if (post.likedCount > 0) {
          post.likedCount--;
        }
      }
    },
    setPostShared(
      state,
      action: PayloadAction<{ postId: number; isShared: boolean }>
    ) {
      const post = state.posts.find((post) => post.id == action.payload.postId);
      if (post) {
        post.isShared = action.payload.isShared;
        action.payload.isShared
          ? post.sharedCount++
          : post.sharedCount > 0 && post.sharedCount--;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(findNewsFeedPosts.pending, (state, action) => {
      state.loading = "loading";
    });
    builder.addCase(findNewsFeedPosts.fulfilled, (state, action) => {
      const currentUserId = action.meta.arg.userId;
      state.posts = postsConverter.updateHomePostsFromResponse(
        action.payload,
        currentUserId
      );
      state.loading = "succeeded";
    });
    builder.addCase(findNewsFeedPosts.rejected, (state, action) => {
      state.loading = "failed";
    });
    builder.addCase(
      updatePostsInteractionsStatusOfSessionUser.fulfilled,
      (state, action) => {
        state.posts = action.payload;
      }
    );
    builder.addCase(deleteEvaluationPost.pending, (state, action) => {
      state.deleteRequestStatus = "pending";
    });
    builder.addCase(deleteEvaluationPost.fulfilled, (state, action) => {
      state.deleteRequestStatus = "succeeded";
      state.posts = state.posts.filter(
        (post) =>
          post.id != action.payload.delete_evaluation_post.returning[0].id
      );
    });
    builder.addCase(deleteEvaluationPost.rejected, (state, action) => {
      state.deleteRequestStatus = "failed";
    });
    builder.addCase(fetchSharedPostsOfFollowings.fulfilled, (state, action) => {
      const sharedPostsOfFollowings = action.payload;
      const sharedPostsThatNotExist: PostState[] = [];

      sharedPostsOfFollowings.forEach((sp) => {
        const existPost = state.posts.find((p) => p.id == sp.id);
        if (existPost) {
          existPost.sharedUsers.push(...sp.sharedUsers);
        } else {
          const post = sharedPostsThatNotExist.find((p) => p.id == sp.id);
          if (post) {
            post.sharedUsers.push(...sp.sharedUsers);
          } else {
            sharedPostsThatNotExist.push(sp);
          }
        }
      });

      state.posts = [...state.posts, ...sharedPostsThatNotExist];
    });
    builder.addCase(
      displayVerifiedStatusOfPostsList.fulfilled,
      (state, action) => {
        state.posts = action.payload;
      }
    );
  },
});

export const {
  increaseCommentCountOfPost,
  setPostsList,
  setPostLiked,
  setPostShared,
} = postListSlice.actions;

export const selectPostListState = (state: RootState) => state.postList;

export default postListSlice.reducer;

export const findNewsFeedPosts = createAsyncThunk(
  "posts/newsFeedPosts",
  async (request: PostListRequestDto, thunkAPI) => {
    return await postListApi.fetchNewsFeedOfUser(request);
  }
);

export const deleteEvaluationPost = createAsyncThunk(
  "posts/deletePost",
  async (deletion: PostDeletionState, thunkAPI) => {
    return await postListApi.deleteEvaluationPost(deletion);
  }
);

export const updatePostsInteractionsStatusOfSessionUser = createAsyncThunk(
  "posts/profile/updatePostsInteractionsOfSessionUser",
  async (request: { userId: number; posts: PostState[] }, thunkAPI) => {
    return await postListApi.updatePostsInteractionsStatusOfSessionUser({
      userId: request.userId,
      posts: request.posts,
    });
  }
);

export const fetchSharedPostsOfFollowings = createAsyncThunk(
  "posts/followings/sharedPosts",
  async (request: { user_id: number }, thunkAPI) => {
    const data = await postListApi.fetchPostsSharedByFollowings(request);

    const postStateList: PostState[] = [];

    data.user[0].followers.forEach((f) =>
      postStateList.push(
        ...f.following_user.post_shares.map((p) => {
          const postState = postsConverter.convertPostDtoToPostState(
            p.shared_posts,
            request.user_id
          );

          postState.sharedUsers.push({
            id: f.following_user.id,
            username: f.following_user.user_name,
          });

          return postState;
        })
      )
    );

    return postStateList;
  }
);

export const displayVerifiedStatusOfPostsList = createAsyncThunk(
  "posts/verified-status",
  async (states: PostState[], thunkAPI): Promise<PostState[]> => {
    const input = states
      .filter((p) => p.hotel?.id != null)
      .map(
        (post) =>
          ({
            user_id: post.postOwner.id,
            hotel_id: post.hotel?.id ?? 0,
          } as UsedProofReqDto)
      );

    const reses = await postListApi.getVerifiedStatus(input);

    let result = [...states];
    reses.forEach((res) => {
      if (res.service_used_proof.length == 0) {
        return;
      }
      const proof = res.service_used_proof[0];
      result = result.map((p) =>
        p.postOwner.id == proof.user_id && p.hotel?.id == proof.hotel_id
          ? { ...p, verified: proof.verified }
          : p
      );
    });

    return result;
  }
);
