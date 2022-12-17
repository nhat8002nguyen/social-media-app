import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PostListRequestDto } from "apis/home/interfaces";
import * as postListApi from "../../../../apis/home/postListAPI";
import { RootState } from "../../../store/store";
import { PostDeletionState } from "./postFormSlice";
import * as postsConverter from "./postsConverter";

export interface PostListState {
  posts: Array<PostState>;
  loading: "idle" | "loading" | "succeeded" | "failed";
  deleteRequestStatus: "idle" | "pending" | "succeeded" | "failed";
}

export interface PostState {
  id: number;
  postOwner: PostOwnerState;
  title: string | null;
  body: string;
  images: Array<ImageState>;
  hotel: HotelState | null;
  locationRating: number;
  cleanlinessRating: number;
  serviceRating: number;
  valueRating: number;
  likedCount: number;
  sharedCount: number;
  commentCount: number;
  isLiked: boolean;
  isShared: boolean;
  sharedUsers: {
    id: number;
    username: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PostOwnerState {
  id: number;
  username: string;
  image: string;
  email?: string;
  shortBio: string | null;
  createdAt: string;
}

export interface ImageState {
  id: number;
  url: string;
}

export interface HotelState {
  id: number;
  name: string;
  location: string;
  about: string;
  rating: number;
}

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
      const sharedPostsNotExist: PostState[] = [];

      sharedPostsOfFollowings.forEach((sp) => {
        const existPost = state.posts.find((p) => p.id == sp.id);
        if (existPost) {
          existPost.sharedUsers.push(...sp.sharedUsers);
        } else {
          const post = sharedPostsNotExist.find((p) => p.id == sp.id);
          if (post) {
            post.sharedUsers.push(...sp.sharedUsers);
          } else {
            sharedPostsNotExist.push(sp);
          }
        }
      });

      state.posts = [...state.posts, ...sharedPostsNotExist];

      state.posts.sort(
        (a, b) =>
          new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
      );
    });
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
