import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PostListRequestDto } from "apis/home/interfaces";
import * as postListApi from "../../../../apis/home/postListAPI";
import { RootState } from "../../../store/store";
import { PostDeletionState } from "./postFormSlice";
import * as postsConverter from "./postsConverter";

export interface PostListState {
  posts: Array<PostState>;
  loading: "idle" | "loading" | "succeeded" | "failed";
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
};

export const postListSlice = createSlice({
  name: "postList",
  initialState,
  reducers: {
    deletePresentedPost(state, action: PayloadAction<PostDeletionState>) {
      state.posts = state.posts.filter(
        (post) => post.id != action.payload.postId
      );
    },
    increaseCommentCountOfPost(state, action: PayloadAction<number>) {
      const targetPost = state.posts.find((post) => post.id == action.payload);
      if (targetPost != null) {
        targetPost.commentCount++;
      }
    },
    increaseLikeCountOfPost(state, action: PayloadAction<number>) {
      const targetPost = state.posts.find((post) => post.id == action.payload);
      if (targetPost != null) {
        targetPost.likedCount++;
      }
    },
    decreaseLikeCountOfPost(state, action: PayloadAction<number>) {
      const targetPost = state.posts.find((post) => post.id == action.payload);
      if (targetPost != null && targetPost.likedCount > 0) {
        targetPost.likedCount--;
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
      if (post != undefined) {
        post.isLiked = action.payload.isLiked;
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
  },
});

export const {
  deletePresentedPost,
  increaseCommentCountOfPost,
  increaseLikeCountOfPost,
  decreaseLikeCountOfPost,
  setPostsList,
  setPostLiked,
} = postListSlice.actions;

export const selectPostListState = (state: RootState) => state.postList;

export default postListSlice.reducer;

export const findNewsFeedPosts = createAsyncThunk(
  "posts/newsFeedPosts",
  async (postList: PostListRequestDto, thunkAPI) => {
    return await postListApi.fetchNewsFeedOfUser(postList);
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
